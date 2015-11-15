package main

import (
	"gopkg.in/inconshreveable/log15.v2"
	"sync"
	"time"
)

func NewBrewServer(l log15.Logger) *BrewServer {
	if l == nil {
		l = log15.New("brew server")
	}

	b := &BrewServer{
		pollDuration: 5 * time.Second,
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
	installed    []*Formula
	mu           sync.RWMutex
}

func (b *BrewServer) poll() {
	t := time.NewTicker(b.pollDuration)

	for range t.C {
		v, err := LocalVersion()

		if err == nil {
			b.version = v
		} else {
			b.logger.Error("local version error", "error", err)
		}
	}
}

func (b *BrewServer) Version() (*Version, error) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	return b.version, nil
}

func (b *BrewServer) ListInstalled() ([]*Formula, error) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	return b.installed, nil
}

func (b *BrewServer) ListAll() ([]*Formula, error) {
	b.mu.RLock()
	defer b.mu.RUnlock()

	return b.all, nil
}

func (b *BrewServer) Info(name string) (*Formula, error) {
	return Info(name)
}
