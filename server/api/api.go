package api

import (
	"github.com/jonasi/mohttp"
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
