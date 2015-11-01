package main

import (
	"encoding/json"
	"fmt"
	"golang.org/x/net/context"
	"os"

	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/api"
	"github.com/jonasi/project/server/plugin"
)

const version = "0.0.1"

var handler, store = mohttp.NewContextValuePair("github.com/jonasi/project/plugins/project-shell")

func getValue(c context.Context) *Commander {
	return store.Get(c).(*Commander)
}

func main() {
	pl := plugin.New("shell", version)

	pl.Use(
		handler(NewCommander()),
	)

	pl.RegisterRoutes(
		GetCommands,
		GetCommand,
		RunCommand,
	)

	os.Exit(pl.RunCmd(os.Args))
}

var GetCommands = mohttp.GET("/api/commands", api.JSON, mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	commander := getValue(c)
	return commander.History(), nil
}))

var GetCommand = mohttp.GET("/api/commands/:id", api.JSON, mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	var (
		id        = mohttp.GetPathValues(c).Params.Int("id")
		commander = getValue(c)
	)

	return commander.GetRun(id), nil
}))

var RunCommand = mohttp.POST("/api/commands", api.JSON, mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	var (
		logger    = plugin.GetLogger(c)
		commander = getValue(c)
	)

	var args struct {
		Args []string `json:"args"`
	}

	if err := json.NewDecoder(mohttp.GetRequest(c).Body).Decode(&args); err != nil {
		logger.Error("JSON decoding error", "error", err)
		return nil, err
	}

	if len(args.Args) < 1 {
		return nil, fmt.Errorf("Invalid args")
	}

	return commander.Run(args.Args...)
}))
