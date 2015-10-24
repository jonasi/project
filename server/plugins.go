package server

import (
	"encoding/json"
	"fmt"
	"github.com/jonasi/http"
	"io"
	"io/ioutil"
	"net"
	nethttp "net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

var localURL, _ = url.Parse("http://whocares.whatever")

type pluginEndpoint struct {
	Method string `json:"method"`
	Path   string `json:"path"`
}

type plugin struct {
	name      string
	path      string
	client    *nethttp.Client
	proxy     *httputil.ReverseProxy
	endpoints []pluginEndpoint
	version   string
}

func (p *plugin) Handle(c *http.Context) {
	p.proxy.ServeHTTP(c.Writer, c.Request)
}

func (p *plugin) req(dest interface{}, method, path string, body io.Reader) error {
	req, err := nethttp.NewRequest(method, "http://whocares.whatever"+path, body)

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

	p.client = localClient(path)
	p.proxy = httputil.NewSingleHostReverseProxy(localURL)
	p.proxy.Transport = p.client.Transport

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

			if p.endpoints == nil {
				var ep []pluginEndpoint
				_ = p.req(&ep, "GET", "/plugin/endpoints", nil)

				if ep != nil {
					p.endpoints = ep
				}
			}

			if p.version != "" && p.endpoints != nil {
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

func listAllPlugins() map[string]plugin {
	var (
		paths   = strings.Split(os.Getenv("PATH"), ":")
		plugins = map[string]plugin{}
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

				plugins[n] = plugin{
					name: n,
					path: filepath.Join(p, fi.Name()),
				}
			}
		}
	}

	return plugins
}

func localClient(sock string) *nethttp.Client {
	return &nethttp.Client{
		Transport: &nethttp.Transport{
			Dial: func(proto, addr string) (net.Conn, error) {
				return net.Dial("unix", sock)
			},
		},
	}
}
