package main

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
	"github.com/jonasi/project/server/plugin"
)

const version = "0.0.1"

var handler, store = mohttp.NewContextValueMiddleware("github.com/jonasi/project/plugins/project-shell")

func getValue(c *mohttp.Context) *Commander {
	return store.Get(c).(*Commander)
}

func main() {
	pl := plugin.New("shell", version)

	pl.Use(
		handler(NewCommander()),
	)

	pl.RegisterRoutes(
		GetCommand,
		RunCommand,
	)

	os.Exit(pl.RunCmd(os.Args))
}

var GetCommand = mohttp.GET("/api/commands/:id", api.JSON, mohttp.HandlerFunc(func(c *mohttp.Context) {
	var (
		id        = c.PathValues().Params.Int("id")
		commander = getValue(c)
		run       = commander.GetRun(id)
	)

	api.JSONResponse(c, run, nil)
}))

var RunCommand = mohttp.POST("/api/commands", api.JSON, mohttp.HandlerFunc(func(c *mohttp.Context) {
	var (
		logger    = plugin.GetLogger(c)
		commander = getValue(c)
	)

	var args struct {
		Args []string `json:"args"`
	}

	if err := json.NewDecoder(c.Request().Body).Decode(&args); err != nil {
		logger.Error("JSON decoding error", "error", err)

		http.Error(c.ResponseWriter(), "Bad Request", http.StatusBadRequest)
		return
	}

	if len(args.Args) < 1 {
		http.Error(c.ResponseWriter(), "Bad Request", http.StatusBadRequest)
		return
	}

	r, err := commander.Run(args.Args...)
	api.JSONResponse(c, r, err)
}))
