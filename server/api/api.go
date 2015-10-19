package api

import (
	"github.com/jonasi/http"
)

var JSON = http.JSON(func(d interface{}) interface{} {
	return d
})

func JSONResponse(c *http.Context, data interface{}, err error) {
	if err != nil {
		http.JSONResponse(c, map[string]interface{}{
			"error": err.Error(),
		})

		return
	}

	http.JSONResponse(c, map[string]interface{}{
		"data": data,
	})
}
