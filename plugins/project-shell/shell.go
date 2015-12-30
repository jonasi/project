package main

import (
	"encoding/json"
	"github.com/jonasi/project/server/id"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
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
	sl  []*Run          // all runs
	mp  map[string]*Run // id -> Run
	mu  sync.RWMutex
}

func (c *Commander) Init() error {
	if err := os.MkdirAll(c.dir, 0755); err != nil {
		return err
	}

	m, err := filepath.Glob(filepath.Join(c.dir, "*", "state"))

	if err != nil {
		return err
	}

	for _, path := range m {
		b, err := ioutil.ReadFile(path)

		if err != nil {
			return err
		}

		var r Run

		if err := json.Unmarshal(b, &r); err != nil {
			return err
		}

		r.dir = filepath.Join(c.dir, r.ID.String())
		c.add(&r)
	}

	sort.Sort(sortedRuns(c.sl))

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
	r := newRun(c.dir, args...)
	c.add(r)

	if err := r.start(); err != nil {
		return nil, err
	}

	go r.wait()

	return r, nil
}

func (c *Commander) add(r *Run) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.mp[r.ID.String()] = r
	c.sl = append(c.sl, r)

	// prune history to last 1000
	diff := len(c.sl) - 1000

	if diff > 0 {
		for i := 0; i < diff; i++ {
			delete(c.mp, c.sl[i].ID.String())
		}

		c.sl = c.sl[diff:]
	}
}

func newRun(dir string, args ...string) *Run {
	id := id.New()

	r := &Run{
		dir:       filepath.Join(dir, id.String()),
		ID:        id,
		Cmd:       args[0],
		Args:      []string{},
		StartedAt: time.Now(),
		ExitCode:  -1,
		State:     "inprogress",
	}

	if len(args) > 1 {
		r.Args = args[1:]
	}

	return r
}

type Run struct {
	dir       string
	cmd       *exec.Cmd
	ID        id.ID     `json:"id"`
	Cmd       string    `json:"cmd"`
	Args      []string  `json:"args"`
	StartedAt time.Time `json:"started_at"`
	State     string    `json:"state"`
	ExitCode  int       `json:"exit_code"`
}

func (r *Run) Stdout() ([]byte, error) {
	return ioutil.ReadFile(filepath.Join(r.dir, "stdout"))
}

func (r *Run) Stderr() ([]byte, error) {
	return ioutil.ReadFile(filepath.Join(r.dir, "stderr"))
}

func (r *Run) start() error {
	if err := os.MkdirAll(r.dir, 0755); err != nil {
		return err
	}

	if err := r.save(); err != nil {
		return err
	}

	r.cmd = exec.Command(r.Cmd, r.Args...)

	var err error
	r.cmd.Stdout, err = os.Create(filepath.Join(r.dir, "stdout"))

	if err != nil {
		return err
	}

	r.cmd.Stderr, err = os.Create(filepath.Join(r.dir, "stderr"))

	if err != nil {
		return err
	}

	return r.cmd.Start()
}

func (r *Run) wait() {
	err := r.cmd.Wait()

	r.cmd.Stdout.(*os.File).Close()
	r.cmd.Stderr.(*os.File).Close()

	r.ExitCode = 0
	r.State = "complete"

	if exErr, ok := err.(*exec.ExitError); ok {
		r.ExitCode = int(exErr.Sys().(syscall.WaitStatus))
	}

	r.save()
}

func (r *Run) save() error {
	b, err := json.Marshal(r)

	if err != nil {
		return err
	}

	return ioutil.WriteFile(filepath.Join(r.dir, "state"), b, 0644)
}

type sortedRuns []*Run

func (s sortedRuns) Len() int           { return len(s) }
func (s sortedRuns) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }
func (s sortedRuns) Less(i, j int) bool { return s[i].StartedAt.Before(s[j].StartedAt) }
