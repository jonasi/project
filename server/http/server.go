package http

import (
	"github.com/jonasi/mohttp"
	"gopkg.in/inconshreveable/log15.v2"
	"gopkg.in/tylerb/graceful.v1"
	"log"
	"net"
	"net/http"
	"os"
	"time"
)

func NewServer(l log15.Logger) *Server {
	if l == nil {
		l = log15.New()
	}

	return &Server{
		Logger: l,
		http: graceful.Server{
			Timeout: 2 * time.Second,
			Server: &http.Server{
				Handler:  mohttp.NewRouter(),
				ErrorLog: log.New(os.Stderr, "HTTP: ", log.LstdFlags),
			},
		},
		stopCh: make(chan struct{}),
	}
}

type Server struct {
	log15.Logger
	http   graceful.Server
	stopCh chan struct{}
	Addr   string
}

func (s *Server) Router() *mohttp.Router {
	return s.http.Handler.(*mohttp.Router)
}

func (s *Server) Use(handlers ...mohttp.Handler) {
	s.Router().Use(handlers...)
}

func (s *Server) Register(routes ...mohttp.Route) {
	for _, rt := range routes {
		s.Info("Registered route", "methods", rt.Method(), "path", rt.Path())
		s.Router().Register(rt)
	}
}

func (s *Server) Listen(addr string) error {
	if addr != "" {
		s.Addr = addr
	}

	s.Info("Starting http server", "addr", s.Addr)
	s.http.Addr = s.Addr
	return s.http.ListenAndServe()
}

func (s *Server) Serve(l net.Listener) error {
	s.Info("Starting http server", "addr", l.Addr())
	return s.http.Serve(l)
}

func (s *Server) Close() {
	s.Info("Stopping http server")
	s.http.Stop(time.Second)
}
