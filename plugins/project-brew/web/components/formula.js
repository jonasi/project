import React, { Component, PropTypes } from 'react';

import { connect } from 'web/common/redux';

const { object } = PropTypes;

@connect({
    state: (state, props) => ({ formula: state.getIn(['formula', props.params.formula]) }),
    onMount: (actions, props) => actions.getFormula(props.params.formula),
})
export default class extends Component {
    static propTypes = {
        formula: object,
        params: object.isRequired,
    };

    render() {
        let { formula } = this.props;

        if (!formula.isSuccess()) {
            return null;
        }

        formula = formula.value.toJS ? formula.value.toJS() : formula.value;

        return <pre><code>{ JSON.stringify(formula, null, "  ") }</code></pre>;
    }
}
