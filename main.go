package main

import (
	"fmt"
	"github.com/jonasi/project/server"
	"github.com/ogier/pflag"
	"os"
	"os/user"
	"path"
)

func main() {
	var (
		server   = pflag.BoolP("server", "s", false, "run the server in the foreground")
		stateDir = pflag.String("statedir", "", "the server state directory")
		help     = pflag.BoolP("help", "h", false, "show this help")
	)

	pflag.Parse()

	if *help {
		runHelp()
	}

	if *server {
		runServer(*stateDir)
	}

	runHelp()
}

func runHelp() {
	pflag.Usage()
	os.Exit(0)
}

func runServer(stateDir string) {
	if stateDir == "" {
		u, err := user.Current()

		if err != nil {
			fmt.Fprintln(os.Stderr, "Could not determine current user: %s", err)
			os.Exit(1)
		}

		stateDir = path.Join(u.HomeDir, ".projay")
	}

	s := server.New(stateDir)

	if err := s.Listen(); err != nil {
		fmt.Fprintln(os.Stderr, "Server err: %s", err)
		os.Exit(1)
	}

	os.Exit(0)
}
