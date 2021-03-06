package client

import (
	"fmt"
	"io"
	"net"
	"net/http"
)

func New(addr string) *Client {
	host, port, _ := net.SplitHostPort(addr)

	if host == "" {
		host = "localhost"
	}

	return &Client{
		http: http.DefaultClient,
		host: host,
		port: port,
	}
}

type Client struct {
	http       *http.Client
	host, port string
}

func (c *Client) Request(plugin, method, path string, body io.Reader, h http.Header) (*http.Request, *http.Response, error) {
	if path[0] != '/' {
		path = "/" + path
	}

	if plugin != "" {
		path = fmt.Sprintf("http://%s:%s/plugins/%s/api%s", c.host, c.port, plugin, path)
	} else {
		path = fmt.Sprintf("http://%s:%s/api%s", c.host, c.port, path)
	}

	req, err := http.NewRequest(method, path, body)

	if err != nil {
		return nil, nil, err
	}

	for k, v := range h {
		req.Header[k] = append(req.Header[k], v...)
	}

	resp, err := c.http.Do(req)
	return req, resp, err
}

func (c *Client) Version() string {
	return Version
}
