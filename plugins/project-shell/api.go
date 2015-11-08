package main

import (
	"encoding/json"
	"fmt"
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/mohttp/middleware"
	"github.com/jonasi/project/server/api"
	"github.com/jonasi/project/server/plugin"
	"golang.org/x/net/context"
)

var apiService = hateoas.NewService(
	hateoas.ServiceUse(api.JSON),
	hateoas.AddResource(
		root,
		getCommands,
		getCommand,
		getCommandStdout,
		getCommandStderr,
		runCommand,
	),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("commands", getCommands),
	hateoas.AddLink("run", runCommand),
)

var getCommands = hateoas.NewResource(
	hateoas.Path("/commands"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		commander := getCommander(c)
		return commander.History(), nil
	})),
)

var getCommand = hateoas.NewResource(
	hateoas.Path("/commands/:id"),
	hateoas.AddLink("stdout", getCommandStdout),
	hateoas.AddLink("stderr", getCommandStderr),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		var (
			id  = mohttp.GetPathValues(c).Params.Int("id")
			run = getCommander(c).GetRun(id)
		)

		if run == nil {
			return nil, &mohttp.HTTPError{404, "Not Found"}
		}

		return run, nil
	})),
)

var getCommandStdout = hateoas.NewResource(
	hateoas.Path("/commands/:id/stdout"),
	hateoas.GET(
		mohttp.DataResponderHandler(&middleware.DetectTypeResponder{}),
		mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
			var (
				id  = mohttp.GetPathValues(c).Params.Int("id")
				run = getCommander(c).GetRun(id)
			)

			if run == nil {
				return "", &mohttp.HTTPError{404, "Not Found"}
			}

			return &run.Stdout, nil
		}),
	),
)

var getCommandStderr = hateoas.NewResource(
	hateoas.Path("/commands/:id/stderr"),
	hateoas.GET(
		mohttp.DataResponderHandler(&middleware.DetectTypeResponder{}),
		mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
			var (
				id  = mohttp.GetPathValues(c).Params.Int("id")
				run = getCommander(c).GetRun(id)
			)

			if run == nil {
				return nil, &mohttp.HTTPError{404, "Not Found"}
			}

			return &run.Stderr, nil
		}),
	),
)

var runCommand = hateoas.NewResource(
	hateoas.Path("/commands"),
	hateoas.POST(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		var (
			logger    = plugin.GetLogger(c)
			commander = getCommander(c)
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
