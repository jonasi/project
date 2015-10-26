package server

import (
	"encoding/json"
	"fmt"
	"github.com/jonasi/mohttp"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

type pluginEndpoint struct {
	Method string `json:"method"`
	Path   string `json:"path"`
}

type plugin struct {
	name    string
	path    string
	client  *http.Client
	proxy   *httputil.ReverseProxy
	version string
}

func (p *plugin) req(dest interface{}, method, path string, body io.Reader) error {
	req, err := http.NewRequest(method, sockHTTPURL.String()+path, body)

	if err != nil {
		return err
	}

	resp, err := p.client.Do(req)

	if err != nil {
		return err
	}

	defer resp.Body.Close()

	return json.NewDecoder(resp.Body).Decode(dest)
}

func (p *plugin) initialize(stateDir string) error {
	path := filepath.Join(stateDir, p.name+".sock")

	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}

	cmd := exec.Command(p.path, "--location="+path, "--verbose")
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return err
	}

	p.client = sockHTTPClient(path)
	p.proxy = sockHTTPReverseProxy(path, "/plugins/"+p.name)

	var (
		waitCh = make(chan error)
		initCh = make(chan struct{})
	)

	go func() {
		waitCh <- cmd.Wait()
	}()

	go func() {
		for {
			if p.version == "" {
				var v map[string]string
				_ = p.req(&v, "GET", "/plugin/version", nil)

				if v != nil && v["version"] != "" {
					p.version = v["version"]
				}
			}

			if p.version != "" {
				initCh <- struct{}{}
				break
			}

			time.Sleep(100 * time.Millisecond)
		}
	}()

	select {
	case <-initCh:
		return nil
	case <-time.After(5 * time.Second):
		return fmt.Errorf("Plugin took longer to initialize than allotted time")
	case err := <-waitCh:
		if err != nil {
			return err
		}
	}

	return nil
}

func (p *plugin) Endpoint() mohttp.Endpoint {
	prefix := "/plugins/" + p.name

	return mohttp.ALL(
		prefix+"/*splat",
		mohttp.StripPrefix(prefix),
		mohttp.FromHTTPHandler(p.proxy),
	)
}

func listAllPlugins() map[string]*plugin {
	var (
		paths   = strings.Split(os.Getenv("PATH"), ":")
		plugins = map[string]*plugin{}
	)

	for _, p := range paths {
		if p == "" {
			p = "."
		}

		f, err := ioutil.ReadDir(p)

		if err != nil {
			continue
		}

		for _, fi := range f {
			var (
				m = fi.Mode()
				n = fi.Name()
			)

			if m.IsDir() {
				continue
			}

			if m.Perm()&0111 == 0 {
				continue
			}

			if strings.HasPrefix(n, "project-") {
				n = n[8:]

				if _, ok := plugins[n]; ok {
					continue
				}

				plugins[n] = &plugin{
					name: n,
					path: filepath.Join(p, fi.Name()),
				}
			}
		}
	}

	return plugins
}
