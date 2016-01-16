import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFormula } from '../actions';

const { object, func } = PropTypes;

@connect(
    (state, props) => ({ formula: state.formula.get(props.params.formula) }),
    dispatch => bindActionCreators({ getFormula }, dispatch)
)
export default class extends Component {
    static propTypes = {
        formula: object,
        params: object.isRequired,
        getFormula: func.isRequired,
    };

    componentWillMount() {
        const { getFormula, params } = this.props;
        getFormula(params.formula);
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
