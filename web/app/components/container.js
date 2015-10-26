import styles from './container.css';
import React, { Component, PropTypes } from 'react';
import { hoc as api } from 'web/common/api';

import Link from 'web/common/components/link';

const { node, object } = PropTypes;

@api({
    plugins: {
        initialValue: [],
        path: () => '/api/plugins',
    },
})
export default class extends Component {
    static propTypes = {
        children: node,
        plugins: object,
    }

    render() {
        const { plugins } = this.props;

        return (
            <div className={ styles.container }>
                <header className={ styles.header }>
                    <h4><Link to="/">Projay</Link></h4>
                </header>
                <div className={ styles.body }>
                    <div className={ styles.sidebar }>
                        <ul>{
                            plugins.value.map(({ name }) => (
                                <li key={ name }>
                                    <Link activeClassName="active" to={ `/web/global/plugins/${ name }` } >{ name }</Link>
                                </li>
                            ))
                        }</ul>
                    </div>
                    <div className={ styles.content }>{
                        this.props.children
                    }</div>
                </div>
            </div>
        );
    }
}
