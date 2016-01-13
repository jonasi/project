import { connect as oldConnect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PropTypes } from 'react';
import { pick } from 'lodash';

export function createAPIAction({ api, type, options, path, method = 'get', ...rest }) {
    return dispatch => {
        dispatch({ type, kind: 'request', ...rest });

        return api[method](path, options)
            .then(body => dispatch({ type, kind: 'response', body, ...rest }));
    };
}

export function handleAPIState({ state, kind, path, success }) {
    const isStr = typeof path === 'string';

    const v = isStr ? state.get(path) : state.getIn(path);
    const v2 = kind === 'request' ? v.setLoading() : v.setValue(success());

    return isStr ? state.set(path, v2): state.setIn(path, v2);
}

function onMountActions(onMount, actions, props) {
    if (typeof onMount === 'function') {
        onMount(actions, props);
        return;
    }

    onMount.forEach(action => actions[action]());
}

export function connect({
    state: mapStateToProps,
    actions: actionNames = [],
    onMount = [],
}) {
    return function(Comp) {
        const Wrapped = oldConnect(mapStateToProps)(Comp);

        class Connected extends Wrapped {
            constructor(props, context) {
                super(props, context);

                const { dispatch } = this.store;
                const { actions } = context;

                this.allActions = bindActionCreators(actions, dispatch);
                this.actions = pick(this.allActions, actionNames);
            }

            componentWillMount() {
                onMountActions(onMount, this.allActions, this.props);
            }

            updateMergedProps() {
                super.updateMergedProps();
                Object.assign(this.mergedProps, this.actions);
            }
        }

        Connected.contextTypes.actions = PropTypes.object.isRequired;

        return Connected;
    };
}
