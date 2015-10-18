package server

import (
	"github.com/jonasi/http"
	"golang.org/x/net/context"
)

type ck string

var serverKey = ck("github.com/jonasi/project/server.Server")

func serverMiddleware(s *Server) http.Handler {
	return http.HandlerFunc(func(c *http.Context) {
		c.Context = context.WithValue(c.Context, serverKey, s)
		c.Next.Handle(c)
	})
}

func getServer(c *http.Context) *Server {
	return c.Context.Value(serverKey).(*Server)
}

var json = http.JSON(func(d interface{}) interface{} {
	return map[string]interface{}{
		"data": d,
	}
})

var GetVersion = http.GET("/version", json,
	http.HandlerFunc(func(c *http.Context) {
		http.JSONResponse(c, Version)
	}),
)

var Shutdown = http.DELETE("/server", json,
	http.HandlerFunc(func(c *http.Context) {
		getServer(c).Close()
		http.JSONResponse(c, true)
	}),
)
