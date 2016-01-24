package main

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/mohttp/middleware"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

var apiService = hateoas.NewService(
	hateoas.ServiceUse(api.JSON),
	hateoas.AddResource(
		root,
		version,
		formulae,
		installed,
		installedFormula,
		formula,
		search,
	),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("version", version),
	hateoas.AddLink("formulae", formulae),
)

var version = hateoas.NewResource(
	hateoas.Path("/version"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		return getBrew(c).Version()
	})),
)

var formulae = hateoas.NewResource(
	hateoas.Path("/formulae"),
	hateoas.GET(
		middleware.EtagHandlerFunc(func(c context.Context) (interface{}, string, error) {
			return getBrew(c).ListAll()
		}),
	),
)

var formula = hateoas.NewResource(
	hateoas.Path("/formulae/:formula"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		name := mohttp.GetPathValues(c).Params.String("formula")
		return getBrew(c).Info(name)
	})),
)

var installed = hateoas.NewResource(
	hateoas.Path("/installed"),
	hateoas.GET(
		middleware.EtagHandlerFunc(func(c context.Context) (interface{}, string, error) {
			return getBrew(c).ListInstalled()
		}),
	),
)

var installedFormula = hateoas.NewResource(
	hateoas.Path("/installed/:formula"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		name := mohttp.GetPathValues(c).Params.String("formula")
		f, err := getBrew(c).Info(name)

		if err != nil {
			return nil, err
		}

		if len(f.Installed) == 0 {
			return nil, mohttp.HTTPError(404)
		}

		return f, nil
	})),
	hateoas.POST(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		name := mohttp.GetPathValues(c).Params.String("formula")
		return getBrew(c).Install(name)
	})),
	hateoas.DELETE(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		name := mohttp.GetPathValues(c).Params.String("formula")
		return getBrew(c).Uninstall(name)
	})),
)

var search = hateoas.NewResource(
	hateoas.Path("/search"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		q := mohttp.GetPathValues(c).Query.String("q")
		return getBrew(c).Search(q)
	})),
)
