package main

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"github.com/jonasi/project/server/api"
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/load"
	"github.com/shirou/gopsutil/process"
	"golang.org/x/net/context"
)

var apiService = hateoas.NewService(
	hateoas.ServiceUse(api.JSON),
	hateoas.AddResource(root, cpuRsc, loadRsc, procRsc),
)

var root = hateoas.NewResource(
	hateoas.Path("/"),
	hateoas.AddLink("cpus", cpuRsc),
	hateoas.AddLink("load", loadRsc),
	hateoas.AddLink("processes", procRsc),
	hateoas.HEAD(mohttp.EmptyBodyHandler),
)

var cpuRsc = hateoas.NewResource(
	hateoas.Path("/cpus"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		return cpu.CPUInfo()
	})),
)

var loadRsc = hateoas.NewResource(
	hateoas.Path("/load"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		return load.LoadAvg()
	})),
)

var procRsc = hateoas.NewResource(
	hateoas.Path("/processes"),
	hateoas.GET(mohttp.DataHandlerFunc(func(c context.Context) (interface{}, error) {
		return process.Pids()
	})),
)
