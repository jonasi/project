package client

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func NewClient(addr string) *Client {
	return &Client{
		http: http.DefaultClient,
		addr: addr,
	}
}

type Client struct {
	http *http.Client
	addr string
}

func (c *Client) req(method, path string, dest interface{}) error {
	req, err := http.NewRequest(method, c.addr+path, nil)

	if err != nil {
		return err
	}

	resp, err := c.http.Do(req)

	if err != nil {
		return err
	}

	var errString *string
	dest = map[string]interface{}{
		"data":  dest,
		"error": errString,
	}

	if err := json.NewDecoder(resp.Body).Decode(&dest); err != nil {
		return err
	}

	if errString != nil {
		return fmt.Errorf(*errString)
	}

	return nil
}

func (c *Client) Version() string {
	return Version
}

func (c *Client) ServerVersion() (string, error) {
	var vers string

	if err := c.req("GET", "/version", &vers); err != nil {
		return "", err
	}

	return vers, nil
}
