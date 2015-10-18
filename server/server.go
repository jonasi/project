package server

import (
	"github.com/jonasi/http"
	"gopkg.in/tylerb/graceful.v1"
	"html/template"
	httpserver "net/http"
	"time"
)

func New() *Server {
	r := http.NewRouter()

	r.Register(
		ServeIndex,
		ServeAssets,

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

	t := template.Must(template.ParseGlob("server/templates/*"))

	r.AddGlobalHandler(
		serverMiddleware(s),
		&http.Template{Template: t},
	)

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
