package brew

import (
	"github.com/jonasi/http"
	"github.com/jonasi/project/server/api"
)

var Endpoints = []*http.Endpoint{
	GetVersion,
	ListFormulae,
	GetFormula,
}

var GetVersion = http.GET("/version", api.JSON, http.HandlerFunc(func(c *http.Context) {
	v, err := LocalVersion()
	api.JSONResponse(c, v, err)
}))

var ListFormulae = http.GET("/formulae", api.JSON, http.HandlerFunc(func(c *http.Context) {
	var (
		filter = c.QueryString("filter")
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

var GetFormula = http.GET("/formulae/:formula", api.JSON, http.HandlerFunc(func(c *http.Context) {
	name := c.Params.ByName("formula")
	f, err := Info(name)

	api.JSONResponse(c, f, err)
}))
