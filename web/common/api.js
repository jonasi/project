import 'whatwg-fetch';

const { fetch } = window;

export default class API {
    constructor(logger, prefix = '') {
        this.prefix = prefix;
        this.logger = logger;
    }

    get(path, options = {}) {
        options.method = 'GET';
        return this.call(path, options);
    }

    post(path, options = {}) {
        options.method = 'POST';
        return this.call(path, options);
    }

    put(path, options = {}) {
        options.method = 'PUT';
        return this.call(path, options);
    }

    delete(path, options = {}) {
        options.method = 'DELETE';
        return this.call(path, options);
    }

    call(path, options = {}) {
        path = this.prefix + path;

        const t = Date.now();
        this.logger.debug('API REQUEST', path, options);

        return fetch(path, options)
            .then(resp => {
                this.logger.debug('API RESPONSE', path, Date.now() - t, resp, headerObj(resp.headers));

                if (resp.headers.get('content-type') !== 'application/json') {
                    return resp.text();
                }

                return resp.json().then(d => {
                    if (d.error) {
                        throw new Error(d.error);
                    }

                    return d.data;
                });
            })
            .then(d => {
                this.logger.debug('API BODY', path, Date.now() - t, d);
                return d;
            }, err => {
                this.logger.error('API ERROR', path, Date.now() - t, err);
                throw err;
            });
    }
}

export function loadPlugin(name) {
    return new Promise(resolve => {
        const cbName = `__plugin_${ name }__`;

        const head = document.getElementsByTagName('head')[0];
        let script = null;

        window[cbName] = function(exports) {
            delete window[cbName];

            head.removeChild(script);
            resolve(exports);
        };

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.src = `/plugins/${ name }/assets/plugin.js`;
        head.appendChild(script);
    });
}

function headerObj(headers) {
    const obj = {};
    headers.forEach((v, k) => obj[k] = v);

    return obj;
}
