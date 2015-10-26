import { createHistory as oldHistory } from 'history';

export default class Comm {
    constructor() {
        this._id = String(Math.random()).substr(2);
        this._parent = window.parent === window ? null : window.parent;

        this.history = createHistory(this);
        window.addEventListener('message', e => this.onMessage(e), false);
    }

    onMessage(e) {
        const { type, method, params } = e.data;

        if (type === 'history') {
            if (method === 'pushState' || method === 'replaceState') {
                params[1] = '/web/global' + params[1];
            }

            this.history[method](...params);
        }
    }

    dispatchHistoryMsg(frame, method, params) {
        this.dispatch(frame, { type: 'history', method, params });
    }

    dispatch(frame, msg) {
        if (frame.contentWindow) {
            frame = frame.contentWindow;
        }

        frame.postMessage(msg, location.origin);
    }
}

export function createHistory(comm) {
    const o = oldHistory();
    const n = Object.assign({}, o);

    const proxy = prop => (...args) => {
        if (!comm._parent) {
            o[prop](...args);
            return;
        }

        comm.dispatchHistoryMsg(comm._parent, prop, args);
    };

    for (const k of ['pushState', 'replaceState', 'go', 'goBack', 'goForward']) {
        n['_' + k] = o[k];
        n[k] = proxy(k);
    }

    return n;
}
