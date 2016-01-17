package main

import (
	"github.com/jonasi/project/server/plugin"
	"os"
)

const version = "0.0.1"

func main() {
	pl := plugin.New("go", version)

	os.Exit(pl.RunCmd(os.Args))
}
