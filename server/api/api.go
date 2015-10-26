package api

import (
	"github.com/jonasi/mohttp"
)

var JSON = mohttp.JSON(func(d interface{}) interface{} {
	return d
})

func JSONResponse(c *mohttp.Context, data interface{}, err error) {
	if err != nil {
		mohttp.JSONResponse(c, map[string]interface{}{
			"error": err.Error(),
		})

		return
	}

	mohttp.JSONResponse(c, map[string]interface{}{
		"data": data,
	})
}
