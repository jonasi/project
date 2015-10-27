package main

import (
	"encoding/json"
	"net/http"
	"os"
	"os/exec"

	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
	"github.com/jonasi/project/server/plugin"
)

const version = "0.0.1"

var handler, store = mohttp.NewContextValueMiddleware("github.com/jonasi/project/plugins/project-shell")

func getValue(c *mohttp.Context) interface{} {
	return store.Get(c)
}

func main() {
	pl := plugin.New("shell", version)

	pl.AddGlobalHandler(
		handler(nil),
	)

	pl.RegisterEndpoints(
		RunCommand,
	)

	os.Exit(pl.RunCmd(os.Args))
}

var RunCommand = mohttp.POST("/api/commands", api.JSON, mohttp.HandlerFunc(func(c *mohttp.Context) {
	logger := plugin.GetLogger(c)

	var args struct {
		Args []string `json:"args"`
	}

	if err := json.NewDecoder(c.Request.Body).Decode(&args); err != nil {
		logger.Error("JSON decoding error", "error", err)

		http.Error(c.Writer, "Bad Request", http.StatusBadRequest)
		return
	}

	if len(args.Args) < 1 {
		http.Error(c.Writer, "Bad Request", http.StatusBadRequest)
		return
	}

	var (
		cmd  = args.Args[0]
		rest = []string{}
	)

	if len(args.Args) > 1 {
		rest = args.Args[1:]
	}

	command := exec.Command(cmd, rest...)
	command.Stderr = os.Stderr
	command.Stdout = os.Stdout

	command.Run()
}))
