package plugin

import (
	"github.com/jonasi/http"
	"golang.org/x/net/context"
	"gopkg.in/inconshreveable/log15.v2"
	nethttp "net/http"
	"path"
)

func New(name, version string) *Plugin {
	l := log15.New("plugin", name)
	l.SetHandler(log15.LvlFilterHandler(log15.LvlError, log15.StderrHandler))

	s := NewServer(l)

	return &Plugin{
		Logger:    l,
		name:      name,
		version:   version,
		endpoints: []http.Endpoint{},
		server:    s,
		cmd:       NewCmd(l, s, version),
	}
}

type Plugin struct {
	log15.Logger
	name      string
	version   string
	endpoints []http.Endpoint
	server    *Server
	cmd       *Cmd
}

func (p *Plugin) RunCmd(args []string) int {
	if err := p.cmd.ParseArgs(args); err != nil {
		p.Error("Parse args error", "error", err)
		return 1
	}

	p.server.Router().AddGlobalHandler(pluginMiddleware(p))
	p.server.RegisterEndpoints(getWeb, getIndex, getAsset, getVersion)
	p.server.RegisterEndpoints(p.endpoints...)

	return p.cmd.Run()
}

func (p *Plugin) RegisterEndpoints(endpoints ...http.Endpoint) {
	p.endpoints = append(p.endpoints, endpoints...)
}

type ck string

var pluginKey = ck("github.com/jonasi/project/plugin.Plugin")

func pluginMiddleware(p *Plugin) http.Handler {
	return http.HandlerFunc(func(c *http.Context) {
		c.Context = context.WithValue(c.Context, pluginKey, p)
		c.Next.Handle(c)
	})
}

func getPlugin(c *http.Context) *Plugin {
	return c.Context.Value(pluginKey).(*Plugin)
}

var getVersion = http.GET("/plugin/version", http.JSON(nil), http.HandlerFunc(func(c *http.Context) {
	p := getPlugin(c)
	http.JSONResponse(c, map[string]interface{}{"version": p.version})
}))

var getAsset = http.GET("/assets/*asset", http.HandlerFunc(func(c *http.Context) {
	p := getPlugin(c)
	path := path.Join("plugins", "project-"+p.name, "web", "public", c.Params.ByName("asset"))
	nethttp.ServeFile(c.Writer, c.Request, path)
}))

var getIndex = http.GET("/", http.Redirect("web"))

var getWeb = http.GET("/web/*web", http.HandlerFunc(func(c *http.Context) {
	p := getPlugin(c)
	http.TemplateResponse(c, "index.html", map[string]interface{}{
		"script": "/plugins/" + p.name + "/assets/app.js",
	})
}))
