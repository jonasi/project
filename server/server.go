package server

import (
	"html/template"
	httpserver "net/http"
	"os"
	"time"

	"github.com/jonasi/http"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
	"gopkg.in/tylerb/graceful.v1"
)

func New(stateDir string) *Server {
	r := http.NewRouter()

	s := &Server{
		Logger:   log15.New(),
		stateDir: stateDir,
		http: graceful.Server{
			Server: &httpserver.Server{
				Addr:    ":40000",
				Handler: r,
			},
		},
		stopCh: make(chan struct{}),
	}

	s.registerEndpoints(
		webEndpoints,
		http.Prefix("/api", apiEndpoints...),
	)

	t := template.Must(template.ParseGlob("server/templates/*"))

	r.AddGlobalHandler(
		middleware.LogRequest(s.Logger),
		serverMiddleware(s),
		http.Template(t),
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

func (s *Server) registerEndpoints(endpoints ...[]http.Endpoint) {
	r := s.http.Server.Handler.(*http.Router)

	for _, eps := range endpoints {
		for _, ep := range eps {
			s.Info("Registered route", "method", ep.Methods(), "path", ep.Paths())
			r.Register(ep)
		}
	}
}

func (s *Server) Listen() error {
	s.Info("Initializing state dir", "dir", s.stateDir)

	if err := os.MkdirAll(s.stateDir, 0755); err != nil {
		return err
	}

	s.Info("Registering plugins")

	s.plugins = listAllPlugins()

	for _, p := range s.plugins {
		s.Info("Plugin found", "plugin", p.name, "path", p.path)

		if err := p.initialize(s.stateDir); err != nil {
			return err
		}

		s.registerEndpoints([]http.Endpoint{p.Endpoint()})
	}

	s.Info("Starting http server", "addr", s.http.Addr)

	return s.http.ListenAndServe()
}

func (s *Server) Close() {
	s.Info("Stopping http server")
	s.http.Stop(time.Second)
}
