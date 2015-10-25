package plugin

import (
	"fmt"
	"github.com/ogier/pflag"
	"gopkg.in/inconshreveable/log15.v2"
	"os"
)

type flags struct {
	*pflag.FlagSet
	help     bool
	location string
	version  bool
	verbose  bool
}

func NewCmd(l log15.Logger, server *Server, version string) *Cmd {
	var (
		flags = &flags{
			FlagSet: pflag.NewFlagSet("", pflag.ExitOnError),
		}
	)

	flags.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage:\n")
		flags.PrintDefaults()
	}

	flags.StringVar(&flags.location, "location", "", "unix socket for http")
	flags.BoolVarP(&flags.help, "help", "h", false, "show help")
	flags.BoolVarP(&flags.version, "version", "v", false, "show version")
	flags.BoolVar(&flags.verbose, "verbose", false, "verbose output")

	return &Cmd{
		Logger:  l,
		flags:   flags,
		Server:  server,
		version: version,
	}
}

type Cmd struct {
	log15.Logger
	Server  *Server
	flags   *flags
	version string
}

func (c *Cmd) ParseArgs(args []string) error {
	err := c.flags.Parse(args)

	if err != nil {
		return err
	}

	if c.flags.verbose {
		c.Logger.SetHandler(log15.LvlFilterHandler(log15.LvlDebug, log15.StderrHandler))
	}

	return nil
}

func (c *Cmd) Run() int {
	if c.flags.help {
		c.flags.Usage()
		return 0
	}

	if c.flags.version {
		fmt.Fprintln(os.Stdout, c.version)
		return 0
	}

	if c.flags.location != "" {
		if err := c.Server.Listen(c.flags.location); err != nil {
			c.Error("Server error", "error", err)
			return 1
		}
	}

	c.Error("Must pass a unix socket location to run the server")
	c.flags.Usage()

	return 1
}
