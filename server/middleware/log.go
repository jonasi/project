package middleware

import (
	"github.com/jonasi/mohttp"
	"gopkg.in/inconshreveable/log15.v2"
)

func LogRequest(l log15.Logger) mohttp.Handler {
	return mohttp.RequestLogger(func(st *mohttp.RequestSummary) {
		l.Info("HTTP Request",
			"start_time", st.StartTime,
			"protocol", st.Protocol,
			"method", st.Method,
			"url", st.URL.String(),
			"client_ip", st.ClientIP,
			"user_agent", st.UserAgent,
			"referer", st.Referer,
			"duration", st.Duration,
			"status_code", st.StatusCode,
			"content_length", st.ContentLength,
		)
	})
}
