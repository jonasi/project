import React, { Component, PropTypes } from 'react';
import { connect } from 'web/common/redux';
import { loadFormula } from '../actions';
import { getFormula } from '../state';

const { object } = PropTypes;

@connect({
    mapState: (state, props) => ({ formula: getFormula(state, props.params.formula) }),
    onMount: props => loadFormula(props.params.formula),
})
export default class extends Component {
    static propTypes = {
        formula: object,
        params: object.isRequired,
    };

    render() {
        let { formula } = this.props;

        if (!formula || !formula.isSuccess()) {
            return null;
        }

        formula = formula.value.toJS ? formula.value.toJS() : formula.value;

        return <pre><code>{ JSON.stringify(formula, null, "  ") }</code></pre>;
    }
}
