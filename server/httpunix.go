package server

import (
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
)

var sockHTTPURL, _ = url.Parse("http://whocares.whatever")

func dialer(sock string) func(network, addr string) (net.Conn, error) {
	return func(proto, addr string) (net.Conn, error) {
		return net.Dial("unix", sock)
	}
}

func sockHTTPClient(sock string) *http.Client {
	return &http.Client{
		Transport: &http.Transport{
			Dial: dialer(sock),
		},
	}
}

type rpTripper struct {
	trp    *http.Transport
	prefix string
}

func (rt *rpTripper) RoundTrip(r *http.Request) (*http.Response, error) {
	resp, err := rt.trp.RoundTrip(r)

	if err != nil {
		return resp, err
	}

	// rewrite location header to be relative, if necessary
	if l := resp.Header.Get("Location"); l != "" {
		resp.Header.Set("Location", rt.prefix+l)
	}

	// hack: remove Content-Length header before RT returns
	// otherwise it's impossible to remove/change from resp
	resp.Header.Del("Content-Length")

	return resp, nil
}

func sockHTTPReverseProxy(sock, prefix string) *httputil.ReverseProxy {
	p := httputil.NewSingleHostReverseProxy(sockHTTPURL)

	p.Transport = &rpTripper{
		prefix: prefix,
		trp: &http.Transport{
			Dial: dialer(sock),
		},
	}

	return p
}
