import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { boundActions } from 'web/common/redux';
import { loadFormula } from '../actions';
import { getFormula } from '../state';

const { object, func } = PropTypes;

@connect(
    (state, props) => ({ formula: getFormula(state, props.params.formula) }),
    boundActions({ loadFormula })
)
export default class extends Component {
    static propTypes = {
        formula: object,
        params: object.isRequired,
        loadFormula: func.isRequired,
    };

    componentWillMount() {
        const { loadFormula, params } = this.props;
        loadFormula(params.formula);
    }

    render() {
        let { formula } = this.props;

        if (!formula || !formula.isSuccess()) {
            return null;
        }

        formula = formula.value.toJS ? formula.value.toJS() : formula.value;

        return <pre><code>{ JSON.stringify(formula, null, "  ") }</code></pre>;
    }
}
