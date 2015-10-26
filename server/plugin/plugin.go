package plugin

import (
	"github.com/jonasi/mohttp"
	"golang.org/x/net/context"
	"gopkg.in/inconshreveable/log15.v2"
	"net/http"
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
		endpoints: []mohttp.Endpoint{},
		server:    s,
		cmd:       NewCmd(l, s, version),
	}
}

type Plugin struct {
	log15.Logger
	name      string
	version   string
	endpoints []mohttp.Endpoint
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

func (p *Plugin) RegisterEndpoints(endpoints ...mohttp.Endpoint) {
	p.endpoints = append(p.endpoints, endpoints...)
}

type ck string

var pluginKey = ck("github.com/jonasi/project/plugin.Plugin")

func pluginMiddleware(p *Plugin) mohttp.Handler {
	return mohttp.HandlerFunc(func(c *mohttp.Context) {
		c.Context = context.WithValue(c.Context, pluginKey, p)
		c.Next.Handle(c)
	})
}

func getPlugin(c *mohttp.Context) *Plugin {
	return c.Context.Value(pluginKey).(*Plugin)
}

var getVersion = mohttp.GET("/plugin/version", mohttp.JSON(nil), mohttp.HandlerFunc(func(c *mohttp.Context) {
	p := getPlugin(c)
	mohttp.JSONResponse(c, map[string]interface{}{"version": p.version})
}))

var getAsset = mohttp.GET("/assets/*asset", mohttp.HandlerFunc(func(c *mohttp.Context) {
	p := getPlugin(c)
	path := path.Join("plugins", "project-"+p.name, "web", "public", c.Params.ByName("asset"))
	http.ServeFile(c.Writer, c.Request, path)
}))

var getIndex = mohttp.GET("/", mohttp.Redirect("web"))

var getWeb = mohttp.GET("/web/*web", mohttp.HandlerFunc(func(c *mohttp.Context) {
	p := getPlugin(c)
	mohttp.TemplateResponse(c, "index.html", map[string]interface{}{
		"script": "/plugins/" + p.name + "/assets/app.js",
	})
}))
