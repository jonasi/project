import styles from './plugin.css';
import React, { Component, PropTypes } from 'react';

const { object } = PropTypes;

export default class extends Component {
    static propTypes = {
        params: object.isRequired,
    }

    render() {
        const { params: { plugin } } = this.props;

        return (
            <div className={ styles.plugin }>
                <iframe src={ `/plugins/${ plugin }` } frameBorder="0" />
            </div>
        );
    }
}
