package server

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/mohttp/middleware"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

var setSrv, getSrv = mohttp.ContextValueAccessors("github.com/jonasi/project/server.Server")

func getServer(c context.Context) *Server {
	return getSrv(c).(*Server)
}

var apiService = hateoas.NewService(
	hateoas.AddResource(root, version, status, plugins),
	hateoas.ServiceUse(api.JSON, api.AddLinkHeaders),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("version", version),
	hateoas.AddLink("status", status),
	hateoas.AddLink("plugins", plugins),
	hateoas.HEAD(mohttp.EmptyBodyHandler),
)

var version = hateoas.NewResource(
	hateoas.Path("/version"),
	hateoas.GET(mohttp.StaticDataHandler(Version)),
)

var status = hateoas.NewResource(
	hateoas.Path("/status"),
	hateoas.PATCH(mohttp.HandlerFunc(func(c context.Context) {
		var body struct {
			Status string `json:"status"`
		}

		if err := middleware.JSONBodyDecode(c, &body); err != nil {
			mohttp.GetResponseWriter(c).WriteHeader(500)
			return
		}

		if body.Status == "inactive" {
			getServer(c).Close()
		}
	})),
)

var plugins = hateoas.NewResource(
	hateoas.Path("/plugins"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
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
	})),
)

type pl struct {
	Name string `json:"name"`
}
