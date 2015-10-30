package main

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
)

var GetVersion = mohttp.GET("/api/version", api.JSON, mohttp.HandlerFunc(func(c *mohttp.Context) {
	v, err := LocalVersion()
	api.JSONResponse(c, v, err)
}))

var ListFormulae = mohttp.GET("/api/formulae", api.JSON, mohttp.HandlerFunc(func(c *mohttp.Context) {
	var (
		filter = c.PathValues().Query.String("filter")
		f      []*Formula
		err    error
	)

	if filter == "all" {
		f, err = ListAll()
	} else {
		f, err = ListInstalled()
	}

	api.JSONResponse(c, f, err)
}))

var GetFormula = mohttp.GET("/api/formulae/:formula", api.JSON, mohttp.HandlerFunc(func(c *mohttp.Context) {
	name := c.PathValues().Params.String("formula")
	f, err := Info(name)

	api.JSONResponse(c, f, err)
}))
