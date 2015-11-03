package main

import (
	"golang.org/x/net/context"
	"os"

	"github.com/jonasi/mohttp"
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

	pl.RegisterAPI(apiService)

	os.Exit(pl.RunCmd(os.Args))
}
