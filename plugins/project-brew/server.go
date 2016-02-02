package main

import (
	"crypto/md5"
	"fmt"
	"gopkg.in/inconshreveable/log15.v2"
	"io"
	"strings"
	"sync"
	"time"
)

const (
	PollDuration = time.Second
)

func NewBrewServer(l log15.Logger) *BrewServer {
	if l == nil {
		l = log15.New("brew server")
	}

	b := &BrewServer{
		pollDuration: PollDuration,
		logger:       l,
	}

	go b.poll()

	return b
}

type BrewServer struct {
	pollDuration time.Duration
	logger       log15.Logger
	version      *Version
	all          []*Formula
	allTok       string
	installed    []*Formula
	installedTok string
	mu           sync.RWMutex
	dirtyFlags   struct {
		installed bool
		all       bool
	}
}

func (b *BrewServer) poll() {
	t := time.NewTicker(b.pollDuration)

	for range t.C {
		v, err := LocalVersion()

		b.mu.RLock()

		if err == nil {
			if b.version == nil || *v != *b.version {
				b.dirtyFlags.all = true
			}

			b.version = v
		} else {
			b.logger.Error("local version error", "error", err)
		}

		b.mu.RUnlock()
	}
}

func (b *BrewServer) Version() (*Version, error) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	return b.version, nil
}

func (b *BrewServer) Config() (map[string]string, error) {
	return Config()
}

func (b *BrewServer) Env() (map[string]string, error) {
	return Env()
}

func (b *BrewServer) ListInstalled() ([]*Formula, string, error) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	if b.installed == nil || b.dirtyFlags.installed {
		f, err := ListInstalled()

		if err != nil {
			return nil, "", err
		}

		b.dirtyFlags.installed = false
		b.installed = f
		b.installedTok = tok(b.installed)
	}

	return b.installed, b.installedTok, nil
}

func (b *BrewServer) ListAll() ([]*Formula, string, error) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	if b.all == nil || b.dirtyFlags.all {
		f, err := ListAll()

		if err != nil {
			return nil, "", err
		}

		b.dirtyFlags.all = false
		b.all = f
		b.allTok = tok(b.all)
	}

	return b.all, b.allTok, nil
}

func (b *BrewServer) Info(name string) (*Formula, error) {
	return Info(name)
}

func (b *BrewServer) Install(name string) (string, error) {
	return Install(name)
}

func (b *BrewServer) Uninstall(name string) (string, error) {
	return Remove(name)
}

func (b *BrewServer) Search(query string) ([]*Formula, error) {
	all, _, err := b.ListAll()

	if err != nil {
		return nil, err
	}

	fo := []*Formula{}

	for _, f := range all {
		if strings.Contains(f.Name, query) {
			fo = append(fo, f)
		}
	}

	return fo, nil
}

func tok(f []*Formula) string {
	t := md5.New()

	for _, fm := range f {
		io.WriteString(t, fm.Name)
		io.WriteString(t, fm.Version)
	}

	return fmt.Sprintf("%x", t.Sum(nil))
}
