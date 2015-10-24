package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

type plugin struct {
	name   string
	path   string
	client *http.Client
}

func (p *plugin) initialize(stateDir string) error {
	path := filepath.Join(stateDir, p.name+".sock")

	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}

	cmd := exec.Command(p.path, "--location="+path)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return err
	}

	p.client = localClient(path)

	var (
		waitCh    = make(chan error)
		versionCh = make(chan string)
	)

	go func() {
		waitCh <- cmd.Wait()
	}()

	go func() {
		for {
			resp, _ := p.client.Get("http://blah.com/plugin/version")

			if resp != nil {
				var v map[string]string

				if err := json.NewDecoder(resp.Body).Decode(&v); err == nil && v["version"] != "" {
					versionCh <- v["version"]
					break
				}
			}

			time.Sleep(100 * time.Millisecond)
		}
	}()

	select {
	case v := <-versionCh:
		println(v)
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

func localClient(sock string) *http.Client {
	return &http.Client{
		Transport: &http.Transport{
			Dial: func(proto, addr string) (net.Conn, error) {
				return net.Dial("unix", sock)
			},
		},
	}
}
