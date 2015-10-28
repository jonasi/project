package main

import (
	"bytes"
	"encoding/json"
	"os/exec"
	"sync"
	"syscall"
	"time"
)

func NewCommander() *Commander {
	return &Commander{
		sl: []*Run{},
		mp: map[int]*Run{},
	}
}

type Commander struct {
	idCounter int
	sl        []*Run
	mp        map[int]*Run
	mu        sync.RWMutex
}

func (c *Commander) GetRun(id int) *Run {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.mp[id]
}

func (c *Commander) Run(args ...string) (*Run, error) {
	r := &Run{
		runBase: runBase{
			Cmd:       args[0],
			Args:      []string{},
			StartedAt: time.Now(),
			ExitCode:  -1,
			State:     "inprogress",
		},
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

	r.ID = c.idCounter
	c.idCounter++
	c.mp[r.ID] = r
	c.sl = append(c.sl, r)

	diff := len(c.sl) - 1000
	if diff > 0 {
		for i := 0; i < diff; i++ {
			delete(c.mp, c.sl[i].ID)
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

type runBase struct {
	ID        int       `json:"id"`
	Cmd       string    `json:"cmd"`
	Args      []string  `json:"args"`
	StartedAt time.Time `json:"started_at"`
	State     string    `json:"state"`
	ExitCode  int       `json:"exit_code"`
}

type Run struct {
	runBase
	Stdout bytes.Buffer
	Stderr bytes.Buffer
}

func (r *Run) MarshalJSON() ([]byte, error) {
	js := struct {
		*runBase
		Stdout []byte `json:"stdout"`
		Stderr []byte `json:"stderr"`
	}{runBase: &r.runBase}

	js.Stdout = r.Stdout.Bytes()
	js.Stderr = r.Stderr.Bytes()

	return json.Marshal(js)
}
