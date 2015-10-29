package server

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
)

var srvContextHandler, srvStore = mohttp.NewContextValueMiddleware("github.com/jonasi/project/server.Server")

var apiRoutes = []mohttp.Route{
	GetVersion,
	Shutdown,
	GetPlugins,
}

func getServer(c *mohttp.Context) *Server {
	return srvStore.Get(c).(*Server)
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
