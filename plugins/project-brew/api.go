package main

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
	"golang.org/x/net/context"
)

var GetVersion = mohttp.GET("/api/version", api.JSON, mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	return LocalVersion()
}))

var ListFormulae = mohttp.GET("/api/formulae", api.JSON, mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	filter := mohttp.GetPathValues(c).Query.String("filter")

	if filter == "all" {
		return ListAll()
	}

	return ListInstalled()
}))

var GetFormula = mohttp.GET("/api/formulae/:formula", api.JSON, mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	name := mohttp.GetPathValues(c).Params.String("formula")
	return Info(name)
}))
