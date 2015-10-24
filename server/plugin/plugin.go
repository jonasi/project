package plugin

import (
	"github.com/jonasi/http"
	"gopkg.in/inconshreveable/log15.v2"
)

func New(name, version string) *Plugin {
	l := log15.New("plugin", name)
	l.SetHandler(log15.LvlFilterHandler(log15.LvlError, log15.StderrHandler))

	s := NewServer(l)

	return &Plugin{
		Logger:    l,
		name:      name,
		version:   version,
		endpoints: []*http.Endpoint{},
		server:    s,
		cmd:       NewCmd(l, s, version),
	}
}

type Plugin struct {
	log15.Logger
	name      string
	version   string
	endpoints []*http.Endpoint
	server    *Server
	cmd       *Cmd
}

func (p *Plugin) RunCmd(args []string) int {
	getVersion := http.GET("/plugin/version", http.JSON(nil), http.HandlerFunc(func(c *http.Context) {
		http.JSONResponse(c, map[string]interface{}{"version": p.version})
	}))

	if err := p.cmd.ParseArgs(args); err != nil {
		p.Error("Parse args error", "error", err)
		return 1
	}

	p.server.RegisterEndpoints(getVersion)
	p.server.RegisterEndpoints(p.endpoints...)

	return p.cmd.Run()
}

func (p *Plugin) RegisterEndpoints(endpoints ...*http.Endpoint) {
	p.endpoints = append(p.endpoints, endpoints...)
}
