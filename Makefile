.PHONY: npm js js_watch

SHELL:=bash
ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
WEB_DIR:=$(ROOT_DIR)/server/web
PATH:=$(WEB_DIR)/node_modules/.bin:$(PATH)

DEBUG=1

npm_install:
	cd $(WEB_DIR) && npm install

js:
	NODE_ENV=$(if $(DEBUG),development,production) webpack --config $(WEB_DIR)/webpack.config.js --progress --colors --display-error-details $(WEBPACK_ARGS)

js_watch:
	$(MAKE) js WEBPACK_ARGS=--watch
