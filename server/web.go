package server

import (
	"github.com/jonasi/mohttp"
	"golang.org/x/net/context"
	"path"
)

var webRoutes = []mohttp.Route{
	ServeIndex,
	ServeWeb,
	ServeAssets,
}

var ServeIndex = mohttp.GET("/", mohttp.Redirect("/web"))

var ServeWeb = mohttp.GET("/web/*splat", mohttp.TemplateHandler(func(c context.Context) (string, map[string]interface{}) {
	return "index.html", map[string]interface{}{
		"script": "/assets/app.js",
	}
}))

var ServeAssets = mohttp.GET("/assets/*asset", mohttp.FileHandler(func(c context.Context) string {
	n := mohttp.GetPathValues(c).Params.String("asset")
	return path.Join("web", "app", "public", n)
}))
