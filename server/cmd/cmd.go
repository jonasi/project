package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"os/exec"
)

type Cmd struct {
	*exec.Cmd
}

func Command(name string, arg ...string) *Cmd {
	return &Cmd{
		exec.Command(name, arg...),
	}
}

func (c *Cmd) runHandleStdout(fn func(io.Reader) error) error {
	out, err := c.StdoutPipe()

	if err != nil {
		return err
	}

	if err := c.Start(); err != nil {
		return err
	}

	if err := fn(out); err != nil {
		return err
	}

	return c.Wait()
}

func (c *Cmd) RunJSON(dest interface{}) error {
	return c.runHandleStdout(func(out io.Reader) error {
		return json.NewDecoder(out).Decode(dest)
	})
}

func (c *Cmd) RunScanf(format string, args ...interface{}) error {
	return c.runHandleStdout(func(out io.Reader) error {
		_, err := fmt.Fscanf(out, format, args...)
		if err != nil && err != io.EOF {
			return err
		}

		return nil
	})
}
