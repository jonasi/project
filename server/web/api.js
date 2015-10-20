import 'whatwg-fetch';

const { fetch } = window;

function get(...args) {
    return fetch(...args).then(d => d.json());
}

export default class BrewAPI {
    formula(name) {
        return get(`/api/brew/formulae/${ name }`);
    }

    formulae() {
        return get('/api/brew/formulae');
    }
}

export default class SystemAPI {

}

export default class API {
    constructor() {
        this.brew = new BrewAPI();
        this.system = new SystemAPI();
    }
}
