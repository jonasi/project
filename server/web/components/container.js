import 'normalize.css';
import 'skeleton.css/skeleton.css'; 
import 'web/fonts/raleway/fonts.css';

import styles from './container.css';
import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router';

const { node } = PropTypes;

const sidebar = [
    ['Brew', '/brew'],
    ['System', '/system'],
    ['Github', '/github'],
    ['BitBucket', '/bitbucket'],
    ['Go', '/go'],
    ['PHP', '/php'],
    ['Ruby', '/ruby'],
    ['Java', '/java'],
    ['Javascript', '/javascript'],
    ['Python', '/python'],
    ['C', '/c'],
    ['C++', '/cplusplus'],
    ['C#', '/csharp'],
    ['Perl', '/perl'],
];

export default class extends Component {
    static propTypes = {
        children: node,
    }

    render() {
        return (
            <div className={ styles.container }>
                <header className={ styles.header }>
                    <h4><Link to="/">Projay</Link></h4>
                </header>
                <div className={ styles.body }>
                    <div className={ styles.sidebar }>
                        <ul>{
                            sidebar.map(([ name, to ]) => (
                                <li>
                                    <Link activeClassName="active" to={ to } >{ name }</Link>
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
