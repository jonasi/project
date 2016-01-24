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
		commands,
		command,
		stdout,
		stderr,
	),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("commands", commands),
)

var commands = hateoas.NewResource(
	hateoas.Path("/commands"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		commander := getCommander(c)
		return commander.History(), nil
	})),
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

var command = hateoas.NewResource(
	hateoas.Path("/commands/:id"),
	hateoas.AddLink("stdout", stdout),
	hateoas.AddLink("stderr", stderr),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		var (
			id  = mohttp.GetPathValues(c).Params.String("id")
			run = getCommander(c).GetRun(id)
		)

		if run == nil {
			return nil, mohttp.HTTPError(404)
		}

		return run, nil
	})),
)

var stdout = hateoas.NewResource(
	hateoas.Path("/commands/:id/stdout"),
	hateoas.GET(
		mohttp.DataResponderHandler(&middleware.DetectTypeResponder{}),
		mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
			var (
				id  = mohttp.GetPathValues(c).Params.String("id")
				run = getCommander(c).GetRun(id)
			)

			if run == nil {
				return "", mohttp.HTTPError(404)
			}

			return run.Stdout()
		}),
	),
)

var stderr = hateoas.NewResource(
	hateoas.Path("/commands/:id/stderr"),
	hateoas.GET(
		mohttp.DataResponderHandler(&middleware.DetectTypeResponder{}),
		mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
			var (
				id  = mohttp.GetPathValues(c).Params.String("id")
				run = getCommander(c).GetRun(id)
			)

			if run == nil {
				return nil, mohttp.HTTPError(404)
			}

			return run.Stderr()
		}),
	),
)
