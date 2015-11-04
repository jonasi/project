package main

import (
	"encoding/json"
	"fmt"
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/project/server/api"
	"github.com/jonasi/project/server/plugin"
	"golang.org/x/net/context"
)

var apiService = hateoas.NewService(
	hateoas.ServiceUse(api.JSON),
	hateoas.AddResource(root, getCommands, getCommand, runCommand),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("commands", getCommands),
	hateoas.AddLink("run", runCommand),
)

var getCommands = hateoas.NewResource(
	hateoas.Path("/commands"),
	hateoas.GET(mohttp.DataHandler(func(c context.Context) (interface{}, error) {
		commander := getValue(c)
		return commander.History(), nil
	})),
)

var getCommand = hateoas.NewResource(
	hateoas.Path("/commands/:id"),
	hateoas.GET(mohttp.DataHandler(func(c context.Context) (interface{}, error) {
		var (
			id        = mohttp.GetPathValues(c).Params.Int("id")
			commander = getValue(c)
		)

		return commander.GetRun(id), nil
	})),
)

var runCommand = hateoas.NewResource(
	hateoas.Path("/commands"),
	hateoas.POST(mohttp.DataHandler(func(c context.Context) (interface{}, error) {
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
	})),
)
