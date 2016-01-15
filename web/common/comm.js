import { useRouterHistory, browserHistory } from 'react-router';

export default class Comm {
    constructor(logger) {
        this._id = String(Math.random()).substr(2);
        this._parent = window.parent === window ? null : window.parent;
        this._logger = logger.tag('component', 'comm');

        this.history = useRouterHistory(createHistory(this))();
        window.addEventListener('message', e => this.onMessage(e), false);
    }

    onMessage(e) {
        const { type, method, params } = e.data;

        if (type === 'history') {
            if (method === 'push' || method === 'replace') {
                if (typeof params[0] === 'string') {
                    params[0] = '/web/global' + params[0];
                } else {
                    params[0].pathname = '/web/global' + params[0].pathname;
                }
            }

            this.history[method](...params);
        }
    }

    dispatchHistoryMsg(frame, method, ...params) {
        this.dispatch(frame, { type: 'history', method, params });
    }

    dispatch(frame, msg) {
        if (frame.contentWindow) {
            frame = frame.contentWindow;
        }

        this._logger.debug('dispatch', msg, { frame: frame.location.toString() });
        frame.postMessage(msg, location.origin);
    }
}

const proxyMethods = ['push', 'pushState', 'replace', 'replaceState', 'go', 'goBack', 'goForward'];

function proxyTransition(old, name, comm) {
    return function(...args) {
        if (!comm._parent) {
            old[name](...args);
            return;
        }

        comm.dispatchHistoryMsg(comm._parent, name, ...args);
    };
}

function createHistory(comm) {
    return function() {
        const n = Object.assign({}, browserHistory);

        for (const k of proxyMethods) {
            n['_' + k] = browserHistory[k];
            n[k] = proxyTransition(browserHistory, k, comm);
        }

        return n;
    };
}
