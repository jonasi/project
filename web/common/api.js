import 'whatwg-fetch';

const { fetch } = window;

export default class API {
    constructor(prefix = '') {
        this.prefix = prefix;
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

        return fetch(path, options)
            .then(resp => {
                if (resp.headers.get('content-type') !== 'application/json') {
                    return resp.text();
                }

                return resp.json().then(d => {
                    if (d.error) {
                        throw new Error(d.error);
                    }

                    return d.data;
                });
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
