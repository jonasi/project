package plugin

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
	"html/template"
	"net"
	"net/http"
)

func NewServer(l log15.Logger) *Server {
	s := &Server{
		Logger: l,
		http: &http.Server{
			Handler: mohttp.NewRouter(),
		},
	}

	t := template.Must(template.ParseGlob("server/templates/*"))

	s.Router().AddGlobalHandler(
		middleware.LogRequest(l),
		mohttp.Template(t),
	)

	return s
}

type Server struct {
	log15.Logger
	http *http.Server
}

func (s *Server) Listen(addr string) error {
	s.Info("Initializing http server", "location", addr)
	l, err := net.Listen("unix", addr)

	if err != nil {
		return err
	}

	return s.http.Serve(l)
}

func (s *Server) Router() *mohttp.Router {
	return s.http.Handler.(*mohttp.Router)
}

func (s *Server) RegisterEndpoints(endpoints ...mohttp.Endpoint) {
	r := s.http.Handler.(*mohttp.Router)

	for _, ep := range endpoints {
		r.Register(ep)
		s.Info("Registered route", "method", ep.Methods(), "path", ep.Paths())
	}
}
