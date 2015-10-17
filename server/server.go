package server

import (
	"github.com/jonasi/http"
	"gopkg.in/tylerb/graceful.v1"
	httpserver "net/http"
	"time"
)

func New() *Server {
	r := http.NewRouter()

	r.Register(
		GetVersion,
		Shutdown,
	)

	s := &Server{
		http: graceful.Server{
			Server: &httpserver.Server{
				Addr:    ":40000",
				Handler: r,
			},
		},
		stopCh: make(chan struct{}),
	}

	r.AddGlobalHandler(serverMiddleware(s))

	return s
}

type Server struct {
	http   graceful.Server
	stopCh chan struct{}
}

func (s *Server) Listen() error {
	return s.http.ListenAndServe()
}

func (s *Server) Close() {
	s.http.Stop(time.Second)
}
