package server

import (
	"encoding/json"
	"html/template"
	"os"
	"path/filepath"

	"github.com/camlistore/lock"
	"github.com/jonasi/mohttp"
	"github.com/jonasi/project/server/http"
	"github.com/jonasi/project/server/middleware"
	"gopkg.in/inconshreveable/log15.v2"
)

func New(sd string) *Server {
	s := &Server{
		Server:   http.NewServer(log15.New()),
		stateDir: stateDir(sd),
	}

	apiService.Use = append(apiService.Use, mohttp.StripPrefixHandler("/api"))

	s.registerRoutes(
		webRoutes,
		mohttp.Prefix("/api", apiService.Routes()...),
	)

	t := template.Must(template.ParseGlob("server/templates/*"))

	s.Use(
		middleware.LogRequest(s.Logger),
		srvContextHandler(s),
		mohttp.Template(t),
	)

	return s
}

type Server struct {
	*http.Server
	stateDir stateDir
	plugins  map[string]*plugin
}

func (s *Server) registerRoutes(routes ...[]mohttp.Route) {
	for _, rts := range routes {
		s.Register(rts...)
	}
}

func (s *Server) Listen(addr string) error {
	s.Info("Initializing state dir", "dir", s.stateDir)

	if err := os.MkdirAll(string(s.stateDir), 0755); err != nil {
		return err
	}

	closer, err := lock.Lock(s.stateDir.LockFile())

	if err != nil {
		return err
	}

	defer closer.Close()

	c := Config{
		Addr: addr,
	}

	if err := writeConfigFile(c, s.stateDir); err != nil {
		return err
	}

	s.Info("Registering plugins")

	s.plugins = listAllPlugins()

	for _, p := range s.plugins {
		s.Info("Plugin found", "plugin", p.name, "path", p.path)

		if err := p.initialize(s.stateDir); err != nil {
			return err
		}

		s.registerRoutes(p.Routes())
	}

	return s.Server.Listen(addr)
}

type Config struct {
	Addr string
}

func writeConfigFile(config Config, sd stateDir) error {
	f, err := os.Create(sd.ConfigFile())

	if err != nil {
		return err
	}

	defer f.Close()

	return json.NewEncoder(f).Encode(config)
}

func ReadConfigFile(sd string) (Config, error) {
	var c Config

	f, err := os.Open(stateDir(sd).ConfigFile())

	if err != nil {
		return Config{}, err
	}

	defer f.Close()

	if err := json.NewDecoder(f).Decode(&c); err != nil {
		return Config{}, err
	}

	return c, nil
}

type stateDir string

func (s stateDir) LockFile() string {
	return filepath.Join(string(s), "server.lock")
}

func (s stateDir) ConfigFile() string {
	return filepath.Join(string(s), "config.json")
}

func (s stateDir) PluginDir(plugin string) string {
	return filepath.Join(string(s), "plugins", plugin)
}

func (s stateDir) PluginSockFile(plugin string) string {
	return filepath.Join(s.PluginDir(plugin), "sock")
}

func (s stateDir) PluginStateDir(plugin string) string {
	return filepath.Join(s.PluginDir(plugin), "state")
}
