package main

import (
	"fmt"
	"github.com/jonasi/project/client"
	"github.com/jonasi/project/server"
	"github.com/ogier/pflag"
	"io"
	"io/ioutil"
	"net/http/httputil"
	"os"
	"os/user"
	"path/filepath"
	"strings"
)

func main() {
	var (
		// general options
		stateDir = pflag.String("statedir", "", "the server state directory")
		help     = pflag.BoolP("help", "h", false, "show this help")

		// server options
		server = pflag.BoolP("server", "s", false, "run the server in the foreground")
		port   = pflag.IntP("port", "p", 40000, "server port to listen on")

		// client options
		method  = pflag.StringP("method", "X", "GET", "client method")
		plugin  = pflag.String("plugin", "", "client plugin")
		data    = pflag.StringP("data", "d", "", "client body")
		verbose = pflag.BoolP("verbose", "v", false, "show full http response")
	)

	pflag.Parse()

	if *help {
		os.Exit(runHelp())
	}

	if *server {
		os.Exit(runServer(*port, *stateDir))
	}

	if pflag.NArg() < 1 {
		fmt.Fprintln(os.Stderr, "must pass in path to make api call")
		runHelp()
		os.Exit(1)
	}

	os.Exit(runClient(*stateDir, *plugin, *method, pflag.Arg(0), *data, *verbose))
}

func runHelp() int {
	pflag.Usage()
	return 0
}

func runClient(stateDir, plugin, method, path, data string, verbose bool) int {
	stateDir, err := getStateDir(stateDir)

	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		return 1
	}

	conf, err := server.ReadConfigFile(stateDir)

	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return 1
	}

	cl := client.New(conf.Addr)

	var body io.Reader

	if data == "-" {
		body = os.Stdin
	} else if data != "" {
		body = strings.NewReader(data)
	}

	req, resp, err := cl.Request(plugin, method, path, body)

	if err != nil {
		fmt.Fprintln(os.Stderr, "request error", err)
		return 1
	}

	if verbose {
		b, _ := httputil.DumpRequestOut(req, true)
		fmt.Fprintln(os.Stderr, string(b))

		b, _ = httputil.DumpResponse(resp, false)
		fmt.Fprintln(os.Stderr, string(b))
	}

	b, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		fmt.Fprintln(os.Stderr, "read all", err)
		return 1
	}

	fmt.Fprintln(os.Stdout, string(b))

	return 0
}

func runServer(port int, stateDir string) int {
	stateDir, err := getStateDir(stateDir)

	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		return 1
	}

	s := server.New(stateDir)

	if err := s.Listen(fmt.Sprintf(":%d", port)); err != nil {
		fmt.Fprintf(os.Stderr, "Server err: %s\n", err)
		return 1
	}

	return 0
}

func getStateDir(stateDir string) (string, error) {
	if stateDir != "" {
		return stateDir, nil
	}

	u, err := user.Current()

	if err != nil {
		return "", fmt.Errorf("Could not determine current user: %s", err)
	}

	return filepath.Join(u.HomeDir, ".projay"), nil
}
