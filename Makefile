.PHONY: npm js js_watch server plugins

SHELL:=bash
ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
WEB_DIR:=$(ROOT_DIR)/web

GOBIN=$(ROOT_DIR)/bin
GOENV=GOBIN=$(GOBIN)

PATH:=$(GOBIN):$(WEB_DIR)/node_modules/.bin:$(PATH)

DEBUG=1

clean:
	$(GOENV) go clean -r -i github.com/jonasi/project/...
	rm -rf $(GOBIN)/*
	rm -rf $(WEB_DIR)/public/*

npm_install:
	cd $(WEB_DIR) && npm install

js:
	NODE_ENV=$(if $(DEBUG),development,production) webpack --config $(WEB_DIR)/app/webpack.config.js --progress --colors --display-error-details $(WEBPACK_ARGS)

js_watch:
	$(MAKE) js WEBPACK_ARGS=--watch

server:
	$(GOENV) time go install -v

plugins:
	$(GOENV) time go install -v ./plugins/...

plugin_js_%_watch:
	$(MAKE) plugin_js_$* WEBPACK_ARGS=--watch

plugin_js_%:
	NODE_ENV=$(if $(DEBUG),development,production) webpack --config $(ROOT_DIR)/plugins/project-$*/web/webpack.config.js --progress --colors --display-error-details $(WEBPACK_ARGS)

