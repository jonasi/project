import { connect as oldConnect } from 'react-redux';
import { boundActions } from './actions';

export default function connect({ mapState, bindActions, merge, onMount }) {
    const mapActions = bindActions ? boundActions(bindActions) : bindActions;

    return function(Comp) {
        const Wrapped = oldConnect(mapState, mapActions, merge)(Comp);

        if (!onMount) {
            return Wrapped;
        }

        return class extends Wrapped {
            componentWillMount() {
                const { dispatch } = this.store;
                const { props } = this;

                coerce(onMount(props))
                    .forEach(action => dispatch(action));
            }
        };
    };
}

function coerce(val) {
    if (!val) {
        return [];
    }

    if (Array.isArray(val)) {
        return val;
    }

    return [val];
}
