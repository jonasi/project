package main

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/plugin"
	"golang.org/x/net/context"
	"os"
)

const version = "0.0.1"

var setBrew, _getBrew = mohttp.ContextValueAccessors("github.com/jonasi/project/plugins/project-brew.Brew")

func getBrew(c context.Context) *BrewServer {
	return _getBrew(c).(*BrewServer)
}

func main() {
	pl := plugin.New("brew", version)
	pl.Use(setBrew(NewBrewServer(pl.Logger)))
	pl.RegisterAPI(apiService)

	os.Exit(pl.RunCmd(os.Args))
}
