.PHONY: npm js js_watch

SHELL:=bash
ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
WEB_DIR:=$(ROOT_DIR)/server/web
PATH:=$(WEB_DIR)/node_modules/.bin:$(PATH)

npm_install:
	cd $(WEB_DIR) && npm install

js:
	cd $(WEB_DIR) && webpack

js_watch:
	cd $(WEB_DIR) && webpack --watch
