package plugin

import (
	"github.com/jonasi/mohttp"
	"golang.org/x/net/context"
	"gopkg.in/inconshreveable/log15.v2"
	"path"
	"path/filepath"
)

func New(name, version string) *Plugin {
	l := log15.New("plugin", name)
	l.SetHandler(log15.LvlFilterHandler(log15.LvlError, log15.StderrHandler))

	s := NewServer(l)

	return &Plugin{
		Logger:  l,
		name:    name,
		version: version,
		routes:  []mohttp.Route{},
		server:  s,
		cmd:     NewCmd(l, s, version),
	}
}

type Plugin struct {
	log15.Logger
	name     string
	stateDir string
	version  string
	routes   []mohttp.Route
	server   *Server
	cmd      *Cmd
}

func (p *Plugin) RunCmd(args []string) int {
	if err := p.cmd.ParseArgs(args); err != nil {
		p.Error("Parse args error", "error", err)
		return 1
	}

	p.stateDir = p.cmd.flags.statedir

	p.Use(plMiddleware(p))
	p.server.Register(getWeb, getIndex, getAsset, getVersion)
	p.server.Register(p.routes...)

	return p.cmd.Run()
}

func (p *Plugin) Use(handlers ...mohttp.Handler) {
	p.server.Router().Use(handlers...)
}

func (p *Plugin) RegisterRoutes(routes ...mohttp.Route) {
	p.routes = append(p.routes, routes...)
}

func (p *Plugin) StateDir(paths ...string) string {
	if len(paths) == 0 {
		return p.stateDir
	}

	paths = append([]string{p.stateDir}, paths...)
	return filepath.Join(paths...)
}

var plMiddleware, store = mohttp.NewContextValuePair("github.com/jonasi/project/plugin.Plugin")

func GetPlugin(c context.Context) *Plugin {
	return store.Get(c).(*Plugin)
}

func GetLogger(c context.Context) log15.Logger {
	return GetPlugin(c).Logger
}

var getVersion = mohttp.GET("/version", mohttp.JSONHandler(func(c context.Context) (interface{}, error) {
	p := GetPlugin(c)

	return map[string]interface{}{"version": p.version}, nil
}))

var getAsset = mohttp.GET("/assets/*asset", mohttp.FileHandler(func(c context.Context) string {
	p := GetPlugin(c)
	return path.Join("plugins", "project-"+p.name, "web", "public", mohttp.GetPathValues(c).Params.String("asset"))
}))

var getIndex = mohttp.GET("/", mohttp.Redirect("web"))

var getWeb = mohttp.GET("/web/*web", mohttp.TemplateHandler(func(c context.Context) (string, map[string]interface{}) {
	p := GetPlugin(c)
	return "index.html", map[string]interface{}{
		"script": "/plugins/" + p.name + "/assets/app.js",
	}
}))
