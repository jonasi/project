import React, { Component, PropTypes } from 'react';

import api from 'web/components/api';

const { object } = PropTypes;

@api({
    formula: {
        initialValue: {},
        path: props => `/api/brew/formulae/${ props.params.name }`,
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
