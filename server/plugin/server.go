package plugin

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/http"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
	"html/template"
	"net"
)

func NewServer(l log15.Logger) *Server {
	s := &Server{
		Server: http.NewServer(l),
	}

	t := template.Must(template.ParseGlob("server/templates/*"))

	s.Use(
		middleware.LogRequest(l),
		mohttp.Template(t),
	)

	return s
}

type Server struct {
	*http.Server
}

func (s *Server) Listen(addr string) error {
	l, err := net.Listen("unix", addr)

	if err != nil {
		return err
	}

	return s.Serve(l)
}
