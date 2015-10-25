import React, { Component, PropTypes } from 'react';

import { hoc as api } from 'web/common/api';

const { object } = PropTypes;

@api({
    formula: {
        initialValue: {},
        path: props => `/plugins/brew/api/formulae/${ props.params.formula }`,
    },
})
export default class extends Component {
    static propTypes = {
        formula: object.isRequired,
    }

    render() {
        return <pre><code>{ JSON.stringify(this.props.formula.toJS(), null, "  ") }</code></pre>;
    }
}
