package plugin

import (
	"github.com/jonasi/http"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
	"html/template"
	"net"
	nethttp "net/http"
)

func NewServer(l log15.Logger) *Server {
	s := &Server{
		Logger: l,
		http: &nethttp.Server{
			Handler: http.NewRouter(),
		},
	}

	t := template.Must(template.ParseGlob("server/templates/*"))

	s.Router().AddGlobalHandler(
		middleware.LogRequest(l),
		http.Template(t),
	)

	return s
}

type Server struct {
	log15.Logger
	http *nethttp.Server
}

func (s *Server) Listen(addr string) error {
	s.Info("Initializing http server", "location", addr)
	l, err := net.Listen("unix", addr)

	if err != nil {
		return err
	}

	return s.http.Serve(l)
}

func (s *Server) Router() *http.Router {
	return s.http.Handler.(*http.Router)
}

func (s *Server) RegisterEndpoints(endpoints ...http.Endpoint) {
	r := s.http.Handler.(*http.Router)

	for _, ep := range endpoints {
		r.Register(ep)
		s.Info("Registered route", "method", ep.Methods(), "path", ep.Paths())
	}
}
