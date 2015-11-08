import { Component, PropTypes } from 'react';

const { any, node } = PropTypes;

export default function(props) {
    const ctxt = Object.assign({}, props);
    delete ctxt.children;

    const types = {};

    for (const k in ctxt) {
        types[k] = any.isRequired;
    }

    return class extends Component {
        static childContextTypes = types

        static propTypes = {
            children: node,
        }

        getChildContext() {
            return ctxt;
        }

        render() {
            return this.props.children;
        }
    };
}
