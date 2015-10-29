package server

import (
	"net/http"
	"path"

	"github.com/jonasi/mohttp"
)

var webRoutes = []mohttp.Route{
	ServeIndex,
	ServeWeb,
	ServeAssets,
}

var ServeIndex = mohttp.GET("/", mohttp.Redirect("/web"))

var ServeWeb = mohttp.GET("/web/*splat", mohttp.HandlerFunc(func(c *mohttp.Context) {
	mohttp.TemplateResponse(c, "index.html", map[string]interface{}{
		"script": "/assets/app.js",
	})
}))

var ServeAssets = mohttp.GET("/assets/*asset", mohttp.HandlerFunc(func(c *mohttp.Context) {
	var (
		n = c.Params.ByName("asset")
		p = path.Join("web", "app", "public", n)
	)

	http.ServeFile(c.Writer, c.Request, p)
}))
