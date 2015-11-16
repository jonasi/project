package main

import (
	"golang.org/x/net/context"
	"os"

	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/plugin"
)

const version = "0.0.1"

var setCmd, getCmd = mohttp.ContextValueAccessors("github.com/jonasi/project/plugins/project-shell")

func getCommander(c context.Context) *Commander {
	return getCmd(c).(*Commander)
}

func main() {
	pl := plugin.New("shell", version)

	pl.RegisterAPI(apiService)

	if code := pl.Parse(os.Args); code > 0 {
		os.Exit(code)
	}

	cmder := NewCommander(pl.StatePath("commands"))

	if err := cmder.Init(); err != nil {
		pl.Error("Commander init error", "error", err)
		os.Exit(1)
	}

	pl.Use(
		setCmd(cmder),
	)

	os.Exit(pl.Run())
}
