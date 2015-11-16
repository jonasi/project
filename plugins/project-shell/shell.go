package main

import (
	"bytes"
	"github.com/jonasi/project/server/id"
	"os"
	"os/exec"
	"sync"
	"syscall"
	"time"
)

func NewCommander(dir string) *Commander {
	return &Commander{
		dir: dir,
		sl:  []*Run{},
		mp:  map[string]*Run{},
	}
}

type Commander struct {
	dir string
	sl  []*Run
	mp  map[string]*Run
	mu  sync.RWMutex
}

func (c *Commander) Init() error {
	if err := os.MkdirAll(c.dir, 0755); err != nil {
		return err
	}

	return nil
}

func (c *Commander) History() []*Run {
	c.mu.Lock()
	defer c.mu.Unlock()

	sl := make([]*Run, len(c.sl))
	copy(sl, c.sl)

	return sl
}

func (c *Commander) GetRun(id string) *Run {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.mp[id]
}

func (c *Commander) Run(args ...string) (*Run, error) {
	r := &Run{
		ID:        id.New(),
		Cmd:       args[0],
		Args:      []string{},
		StartedAt: time.Now(),
		ExitCode:  -1,
		State:     "inprogress",
	}

	if len(args) > 1 {
		r.Args = args[1:]
	}

	command := exec.Command(r.Cmd, r.Args...)
	command.Stderr = &r.Stderr
	command.Stdout = &r.Stdout

	if err := command.Start(); err != nil {
		return nil, err
	}

	c.mu.Lock()

	c.mp[r.ID.String()] = r
	c.sl = append(c.sl, r)

	diff := len(c.sl) - 1000
	if diff > 0 {
		for i := 0; i < diff; i++ {
			delete(c.mp, c.sl[i].ID.String())
		}

		c.sl = c.sl[diff:]
	}

	c.mu.Unlock()

	go func() {
		err := command.Wait()
		r.ExitCode = 0
		r.State = "complete"

		if exErr, ok := err.(*exec.ExitError); ok {
			r.ExitCode = int(exErr.Sys().(syscall.WaitStatus))
		}
	}()

	return r, nil
}

type Run struct {
	ID        id.ID        `json:"id"`
	Cmd       string       `json:"cmd"`
	Args      []string     `json:"args"`
	StartedAt time.Time    `json:"started_at"`
	State     string       `json:"state"`
	ExitCode  int          `json:"exit_code"`
	Stdout    bytes.Buffer `json:"-"`
	Stderr    bytes.Buffer `json:"-"`
}
