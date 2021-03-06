package server

import (
	"encoding/json"
	"fmt"
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/middleware"
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

type pluginRoute struct {
	Method string `json:"method"`
	Path   string `json:"path"`
}

type plugin struct {
	name    string
	path    string
	client  *http.Client
	proxy   *httputil.ReverseProxy
	cmd     *exec.Cmd
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

func (p *plugin) initialize(sd stateDir) error {
	var (
		pluginDir      = sd.PluginDir(p.name)
		sockFile       = sd.PluginSockFile(p.name)
		pluginStateDir = sd.PluginStateDir(p.name)
	)

	if err := os.MkdirAll(pluginDir, 0755); err != nil {
		return err
	}

	if err := os.Remove(sockFile); err != nil && !os.IsNotExist(err) {
		return err
	}

	if err := os.MkdirAll(pluginStateDir, 0755); err != nil {
		return err
	}

	p.cmd = exec.Command(p.path, "--location="+sockFile, "--statedir="+pluginStateDir, "--verbose")
	p.cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	p.cmd.Stdout = os.Stdout
	p.cmd.Stderr = os.Stderr

	if err := p.cmd.Start(); err != nil {
		return err
	}

	p.client = sockHTTPClient(sockFile)
	p.proxy = sockHTTPReverseProxy(sockFile, "/plugins/"+p.name)

	var (
		waitCh = make(chan error)
		initCh = make(chan struct{})
	)

	go func() {
		waitCh <- p.cmd.Wait()
	}()

	go func() {
		for {
			if p.version == "" {
				var v map[string]string
				_ = p.req(&v, "GET", "/version", nil)

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

func (p *plugin) Routes() []mohttp.Route {
	prefix := "/plugins/" + p.name

	return mohttp.ALL(
		prefix+"/*splat",
		middleware.StripPrefixHandler(prefix),
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
