package server

import (
	"net"
	nethttp "net/http"
	"net/http/httputil"
	"net/url"
)

var sockHTTPURL, _ = url.Parse("http://whocares.whatever")

func dialer(sock string) func(network, addr string) (net.Conn, error) {
	return func(proto, addr string) (net.Conn, error) {
		return net.Dial("unix", sock)
	}
}

func sockHTTPClient(sock string) *nethttp.Client {
	return &nethttp.Client{
		Transport: &nethttp.Transport{
			Dial: dialer(sock),
		},
	}
}

type rpTripper struct {
	trp    *nethttp.Transport
	prefix string
}

func (rt *rpTripper) RoundTrip(r *nethttp.Request) (*nethttp.Response, error) {
	resp, err := rt.trp.RoundTrip(r)

	if err != nil {
		return resp, err
	}

	// rewrite header to be
	if l := resp.Header.Get("Location"); l != "" {
		resp.Header.Set("Location", rt.prefix+l)
	}

	return resp, nil
}

func sockHTTPReverseProxy(sock, prefix string) *httputil.ReverseProxy {
	p := httputil.NewSingleHostReverseProxy(sockHTTPURL)

	p.Transport = &rpTripper{
		prefix: prefix,
		trp: &nethttp.Transport{
			Dial: dialer(sock),
		},
	}

	return p
}
