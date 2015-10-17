package main

import (
	"github.com/jonasi/project/server"
	"github.com/ogier/pflag"
	"os"
)

func main() {
	var (
		foreground = pflag.BoolP("foreground", "f", false, "run the server in the foreground")
		help       = pflag.BoolP("help", "h", false, "show this help")
	)

	pflag.Parse()

	if *help {
		pflag.Usage()
		os.Exit(0)
	}

	if *foreground {
	}

	s := server.New()

	if err := s.Listen(); err != nil {
		panic(err)
	}
}
