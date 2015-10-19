package brew

import (
	"github.com/jonasi/http"
	"github.com/jonasi/project/server/api"
)

var Endpoints = []*http.Endpoint{
	ListFormulae,
	GetFormula,
}

var ListFormulae = http.GET("/formulae", api.JSON, http.HandlerFunc(func(c *http.Context) {
	f, err := List()
	api.JSONResponse(c, f, err)
}))

var GetFormula = http.GET("/formulae/:formula", api.JSON, http.HandlerFunc(func(c *http.Context) {
	name := c.Params.ByName("formula")
	f, err := Info(name)

	api.JSONResponse(c, f, err)
}))
