import 'whatwg-fetch';

const { fetch } = window;

export default class API {
    get(...args) {
        return fetch(...args).then(d => d.json()).then(d => {
            if (d.error) {
                throw new Error(d.error);
            }

            return d.data;
        });
    }
}
