package plugin

import (
	"github.com/jonasi/http"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
	"net"
	nethttp "net/http"
)

func NewServer(l log15.Logger) *Server {
	r := http.NewRouter()

	r.AddGlobalHandler(
		middleware.LogRequest(l),
	)

	return &Server{
		Logger: l,
		http: &nethttp.Server{
			Handler: r,
		},
	}
}

type Server struct {
	log15.Logger
	Addr string
	http *nethttp.Server
}

func (s *Server) Listen() error {
	s.Info("Initializing http server", "location", s.Addr)
	l, err := net.Listen("unix", s.Addr)

	if err != nil {
		return err
	}

	return s.http.Serve(l)
}

func (s *Server) RegisterEndpoints(endpoints ...*http.Endpoint) {
	r := s.http.Handler.(*http.Router)

	for _, ep := range endpoints {
		r.Register(ep)
		s.Info("Registered route", "method", ep.Method, "path", ep.Path)
	}
}
