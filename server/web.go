package server

import (
	nethttp "net/http"
	"path"

	"github.com/jonasi/http"
)

var webEndpoints = []http.Endpoint{
	ServeIndex,
	ServeWeb,
	ServeAssets,
}

var ServeIndex = http.GET("/", http.Redirect("/web"))

var ServeWeb = http.GET("/web/*splat", http.HandlerFunc(func(c *http.Context) {
	http.TemplateResponse(c, "index.html", map[string]interface{}{
		"script": "/assets/app.js",
	})
}))

var ServeAssets = http.GET("/assets/*asset", http.HandlerFunc(func(c *http.Context) {
	var (
		n = c.Params.ByName("asset")
		p = path.Join("web", "app", "public", n)
	)

	nethttp.ServeFile(c.Writer, c.Request, p)
}))
