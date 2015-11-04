package server

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

var srvContextHandler, srvStore = mohttp.NewContextValuePair("github.com/jonasi/project/server.Server")

func getServer(c context.Context) *Server {
	return srvStore.Get(c).(*Server)
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
	hateoas.GET(mohttp.DataHandler(func(c context.Context) (interface{}, error) {
		resource, _ := hateoas.GetResource(c)
		return resource.Links(), nil
	})),
)

var version = hateoas.NewResource(
	hateoas.Path("/version"),
	hateoas.GET(mohttp.DataHandler(func(c context.Context) (interface{}, error) {
		return Version, nil
	})),
)

var status = hateoas.NewResource(
	hateoas.Path("/status"),
	hateoas.PATCH(mohttp.HandlerFunc(func(c context.Context) {
		var body struct {
			Status string `json:"status"`
		}

		if err := mohttp.JSONBodyDecode(c, &body); err != nil {
			mohttp.Error(c, "Internal Server Error", 500)
			return
		}

		if body.Status == "inactive" {
			getServer(c).Close()
		}
	})),
)

var plugins = hateoas.NewResource(
	hateoas.Path("/plugins"),
	hateoas.GET(mohttp.DataHandler(func(c context.Context) (interface{}, error) {
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
