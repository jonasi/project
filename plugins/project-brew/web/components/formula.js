import React, { Component, PropTypes } from 'react';

import connect from 'web/common/connect';

const { object, func } = PropTypes;

@connect(
    (state, props) => ({ formula: state.getIn(['formula', props.params.formula]) }),
    ['getFormula']
)
export default class extends Component {
    static propTypes = {
        formula: object,
        params: object.isRequired,
        getFormula: func.isRequired,
    }

    componentWillMount() {
        const { params, getFormula } = this.props;
        getFormula(params.formula);
    }

    render() {
        let { formula = {} } = this.props;
        formula = formula.toJS ? formula.toJS() : formula;

        return <pre><code>{ JSON.stringify(formula, null, "  ") }</code></pre>;
    }
}
