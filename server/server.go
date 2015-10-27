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

func New(stateDir string) *Server {
	r := mohttp.NewRouter()

	s := &Server{
		Logger:   log15.New(),
		stateDir: stateDir,
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
		serverMiddleware(s),
		mohttp.Template(t),
	)

	return s
}

type Server struct {
	log15.Logger
	http     graceful.Server
	stopCh   chan struct{}
	stateDir string
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

	if err := os.MkdirAll(s.stateDir, 0755); err != nil {
		return err
	}

	lockFile := filepath.Join(s.stateDir, "server.lock")
	closer, err := lock.Lock(lockFile)

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

func writeConfigFile(config Config, stateDir string) error {
	f, err := os.Create(filepath.Join(stateDir, "config.json"))

	if err != nil {
		return err
	}

	defer f.Close()

	return json.NewEncoder(f).Encode(config)
}

func ReadConfigFile(stateDir string) (Config, error) {
	var c Config

	f, err := os.Open(filepath.Join(stateDir, "config.json"))

	if err != nil {
		return Config{}, err
	}

	defer f.Close()

	if err := json.NewDecoder(f).Decode(&c); err != nil {
		return Config{}, err
	}

	return c, nil
}
