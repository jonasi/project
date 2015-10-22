package server

import (
	"github.com/jonasi/http"
	nethttp "net/http"
	"path"
)

var clientRoutes = []string{
	"/",
	"/brew/*var",
	"/system",
}

var webEndpoints = append(
	serveIndex(clientRoutes...),
	ServeAssets,
)

func serveIndex(routes ...string) []*http.Endpoint {
	eps := make([]*http.Endpoint, len(routes))

	for i, rt := range routes {
		eps[i] = http.GET(rt, http.HandlerFunc(func(c *http.Context) {
			http.TemplateResponse(c, "index.html", nil)
		}))
	}

	return eps
}

var ServeAssets = http.GET("/assets/*asset", http.HandlerFunc(func(c *http.Context) {
	p := path.Join("server", "web", "public", c.Params.ByName("asset"))
	nethttp.ServeFile(c.Writer, c.Request, p)
}))
