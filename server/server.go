package server

import (
	"html/template"
	httpserver "net/http"
	"os"
	"time"

	"github.com/jonasi/http"
	"github.com/jonasi/project/server/brew"
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
		prefix("/api", apiEndpoints...),
		prefix("/api/brew", brew.Endpoints...),
	)

	t := template.Must(template.ParseGlob("server/templates/*"))

	r.AddGlobalHandler(
		logReq(s.Logger),
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
}

func (s *Server) registerEndpoints(endpoints ...[]*http.Endpoint) {
	r := s.http.Server.Handler.(*http.Router)

	for _, eps := range endpoints {
		for _, ep := range eps {
			s.Info("Registered route", "method", ep.Method, "path", ep.Path)
			r.Register(ep)
		}
	}
}

func (s *Server) Listen() error {
	s.Info("Initializing state dir", "dir", s.stateDir)

	if err := os.MkdirAll(s.stateDir, 0755); err != nil {
		return err
	}

	s.Info("Starting http server", "addr", s.http.Addr)

	return s.http.ListenAndServe()
}

func (s *Server) Close() {
	s.Info("Stopping http server")
	s.http.Stop(time.Second)
}

func logReq(l log15.Logger) http.Handler {
	return http.Logger(func(st *http.RequestStats) {
		l.Info("http request", "stats", st)
	})
}

func prefix(prefix string, endpoints ...*http.Endpoint) []*http.Endpoint {
	eps := make([]*http.Endpoint, len(endpoints))

	for i, ep := range endpoints {
		eps[i] = &http.Endpoint{
			Method:   ep.Method,
			Path:     prefix + ep.Path,
			Handlers: ep.Handlers,
		}
	}

	return eps
}
