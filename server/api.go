package server

import (
	"github.com/jonasi/http"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

type ck string

var serverKey = ck("github.com/jonasi/project/server.Server")

var apiEndpoints = []http.Endpoint{
	GetVersion,
	Shutdown,
	GetPlugins,
}

func serverMiddleware(s *Server) http.Handler {
	return http.HandlerFunc(func(c *http.Context) {
		c.Context = context.WithValue(c.Context, serverKey, s)
		c.Next.Handle(c)
	})
}

func getServer(c *http.Context) *Server {
	return c.Context.Value(serverKey).(*Server)
}

var GetVersion = http.GET("/version", api.JSON,
	http.HandlerFunc(func(c *http.Context) {
		api.JSONResponse(c, Version, nil)
	}),
)

var Shutdown = http.DELETE("/server", api.JSON,
	http.HandlerFunc(func(c *http.Context) {
		getServer(c).Close()
		api.JSONResponse(c, true, nil)
	}),
)

type pl struct {
	Name string `json:"name"`
}

var GetPlugins = http.GET("/plugins", api.JSON,
	http.HandlerFunc(func(c *http.Context) {
		var (
			plugins = getServer(c).plugins
			resp    = make([]pl, len(plugins))
		)

		i := 0
		for _, p := range plugins {
			resp[i].Name = p.name
			i++
		}

		api.JSONResponse(c, resp, nil)
	}),
)
