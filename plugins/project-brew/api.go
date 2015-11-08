package main

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/mohttp/middleware"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
	"time"
)

var apiService = hateoas.NewService(
	hateoas.ServiceUse(api.JSON),
	hateoas.AddResource(root, getVersion, listFormulae, getFormula),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("version", getVersion),
	hateoas.AddLink("formulae", listFormulae),
)

var getVersion = hateoas.NewResource(
	hateoas.Path("/version"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		return LocalVersion()
	})),
)

var listFormulae = hateoas.NewResource(
	hateoas.Path("/formulae"),
	hateoas.GET(
		&middleware.TimedCache{
			Duration: time.Minute,
		},
		mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
			filter := mohttp.GetPathValues(c).Query.String("filter")

			if filter == "all" {
				return ListAll()
			}

			return ListInstalled()
		}),
	),
)

var getFormula = hateoas.NewResource(
	hateoas.Path("/formulae/:formula"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		name := mohttp.GetPathValues(c).Params.String("formula")
		return Info(name)
	})),
)
