package api

import (
	"github.com/jonasi/mohttp"
	"github.com/jonasi/mohttp/hateoas"
	"golang.org/x/net/context"
)

var JSON = &mohttp.JSONOptions{
	HandleErr: func(c context.Context, err error) interface{} {
		return map[string]interface{}{
			"error": err.Error(),
		}
	},

	Transform: func(data interface{}) interface{} {
		return map[string]interface{}{
			"data": data,
		}
	},
}

var AddLinkHeaders = mohttp.HandlerFunc(func(c context.Context) {
	res, ok := hateoas.GetResource(c)

	if ok {
		var (
			rw    = mohttp.GetResponseWriter(c)
			links = res.Links()
		)

		for i := range links {
			rw.Header().Add("Link", links[i].Header())
		}
	}

	mohttp.Next(c)
})
