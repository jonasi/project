package main

import (
	"fmt"
	"github.com/jonasi/project/server"
	"github.com/ogier/pflag"
	"os"
)

func main() {
	var (
		runServer = pflag.BoolP("server", "s", false, "run the server in the foreground")
		help      = pflag.BoolP("help", "h", false, "show this help")
	)

	pflag.Parse()

	if *help {
		pflag.Usage()
		os.Exit(0)
	}

	if *runServer {
		s := server.New()

		if err := s.Listen(); err != nil {
			fmt.Fprintln(os.Stderr, "Server err: %s", err)
			os.Exit(1)
		}

		os.Exit(0)
	}

}
