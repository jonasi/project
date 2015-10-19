package server

import (
	"github.com/jonasi/http"
	nethttp "net/http"
	"path"
)

var webEndpoints = []*http.Endpoint{
	ServeIndex,
	ServeAssets,
}

var ServeIndex = http.GET("/", http.HandlerFunc(func(c *http.Context) {
	http.TemplateResponse(c, "index.html", nil)
}))

var ServeAssets = http.GET("/assets/*asset", http.HandlerFunc(func(c *http.Context) {
	p := path.Join("server", "web", "public", c.Params.ByName("asset"))
	nethttp.ServeFile(c.Writer, c.Request, p)
}))
