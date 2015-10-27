package server

import (
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/camlistore/lock"
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
	"gopkg.in/tylerb/graceful.v1"
)

func New(sd string) *Server {
	r := mohttp.NewRouter()

	s := &Server{
		Logger:   log15.New(),
		stateDir: stateDir(sd),
		http: graceful.Server{
			Server: &http.Server{
				Handler: r,
			},
		},
		stopCh: make(chan struct{}),
	}

	s.registerEndpoints(
		webEndpoints,
		mohttp.Prefix("/api", apiEndpoints...),
	)

	t := template.Must(template.ParseGlob("server/templates/*"))

	r.AddGlobalHandler(
		middleware.LogRequest(s.Logger),
		srvContextHandler(s),
		mohttp.Template(t),
	)

	return s
}

type Server struct {
	log15.Logger
	http     graceful.Server
	stopCh   chan struct{}
	stateDir stateDir
	plugins  map[string]*plugin
}

func (s *Server) registerEndpoints(endpoints ...[]mohttp.Endpoint) {
	r := s.http.Server.Handler.(*mohttp.Router)

	for _, eps := range endpoints {
		for _, ep := range eps {
			s.Info("Registered route", "method", ep.Methods(), "path", ep.Paths())
			r.Register(ep)
		}
	}
}

func (s *Server) Listen(addr string) error {
	s.Info("Initializing state dir", "dir", s.stateDir)

	if err := os.MkdirAll(string(s.stateDir), 0755); err != nil {
		return err
	}

	closer, err := lock.Lock(s.stateDir.LockFile())

	if err != nil {
		fmt.Printf("err = %#v\n", err)
		return err
	}

	defer closer.Close()

	c := Config{
		Addr: addr,
	}

	if err := writeConfigFile(c, s.stateDir); err != nil {
		return err
	}

	s.Info("Registering plugins")

	s.plugins = listAllPlugins()

	for _, p := range s.plugins {
		s.Info("Plugin found", "plugin", p.name, "path", p.path)

		if err := p.initialize(s.stateDir); err != nil {
			return err
		}

		s.registerEndpoints([]mohttp.Endpoint{p.Endpoint()})
	}

	s.Info("Starting http server", "addr", s.http.Addr)

	s.http.Addr = addr
	return s.http.ListenAndServe()
}

func (s *Server) Close() {
	s.Info("Stopping http server")
	s.http.Stop(time.Second)
}

type Config struct {
	Addr string
}

func writeConfigFile(config Config, sd stateDir) error {
	f, err := os.Create(sd.ConfigFile())

	if err != nil {
		return err
	}

	defer f.Close()

	return json.NewEncoder(f).Encode(config)
}

func ReadConfigFile(sd string) (Config, error) {
	var c Config

	f, err := os.Open(stateDir(sd).ConfigFile())

	if err != nil {
		return Config{}, err
	}

	defer f.Close()

	if err := json.NewDecoder(f).Decode(&c); err != nil {
		return Config{}, err
	}

	return c, nil
}

type stateDir string

func (s stateDir) LockFile() string {
	return filepath.Join(string(s), "server.lock")
}

func (s stateDir) ConfigFile() string {
	return filepath.Join(string(s), "config.json")
}

func (s stateDir) PluginDir(plugin string) string {
	return filepath.Join(string(s), "plugins", plugin)
}

func (s stateDir) PluginSockFile(plugin string) string {
	return filepath.Join(s.PluginDir(plugin), "sock")
}

func (s stateDir) PluginStateDir(plugin string) string {
	return filepath.Join(s.PluginDir(plugin), "state")
}
