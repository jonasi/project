package server

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

var srvContextHandler, srvStore = mohttp.NewContextValuePair("github.com/jonasi/project/server.Server")

var apiRoutes = []mohttp.Route{
	GetVersion,
	Shutdown,
	GetPlugins,
}

func getServer(c context.Context) *Server {
	return srvStore.Get(c).(*Server)
}

var GetVersion = mohttp.GET("/version", api.JSON,
	mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
		return Version, nil
	}),
)

var Shutdown = mohttp.DELETE("/server", api.JSON,
	mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
		getServer(c).Close()
		return true, nil
	}),
)

type pl struct {
	Name string `json:"name"`
}

var GetPlugins = mohttp.GET("/plugins", api.JSON,
	mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
		var (
			plugins = getServer(c).plugins
			resp    = make([]pl, len(plugins))
		)

		i := 0
		for _, p := range plugins {
			resp[i].Name = p.name
			i++
		}

		return resp, nil
	}),
)
