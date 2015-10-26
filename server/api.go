package server

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

type ck string

var serverKey = ck("github.com/jonasi/project/server.Server")

var apiEndpoints = []mohttp.Endpoint{
	GetVersion,
	Shutdown,
	GetPlugins,
}

func serverMiddleware(s *Server) mohttp.Handler {
	return mohttp.HandlerFunc(func(c *mohttp.Context) {
		c.Context = context.WithValue(c.Context, serverKey, s)
		c.Next.Handle(c)
	})
}

func getServer(c *mohttp.Context) *Server {
	return c.Context.Value(serverKey).(*Server)
}

var GetVersion = mohttp.GET("/version", api.JSON,
	mohttp.HandlerFunc(func(c *mohttp.Context) {
		api.JSONResponse(c, Version, nil)
	}),
)

var Shutdown = mohttp.DELETE("/server", api.JSON,
	mohttp.HandlerFunc(func(c *mohttp.Context) {
		getServer(c).Close()
		api.JSONResponse(c, true, nil)
	}),
)

type pl struct {
	Name string `json:"name"`
}

var GetPlugins = mohttp.GET("/plugins", api.JSON,
	mohttp.HandlerFunc(func(c *mohttp.Context) {
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
