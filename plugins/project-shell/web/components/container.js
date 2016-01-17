import { container } from './container.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { runCommand } from '../actions';
import { routeActions } from 'redux-simple-router';

const { func, node, object } = PropTypes;

@connect(
    state => ({ history: state.app.history }),
    dispatch => bindActionCreators({ runCommand, push: routeActions.push }, dispatch)
)
export default class ShellContainer extends Component {
    static propTypes = {
        runCommand: func.isRequired,
        push: func.isRequired,
        children: node,
        history: object,
    };

    componentWillReceiveProps(props) {
        const { history, push } = this.props;

        if (history.isSuccess() && props.history.isSuccess() && history.value.size && history.value.first() && history.value.first().id !== props.history.value.first().id) {
            push(`/plugins/shell/web/commands/${ props.history.value.first().id }`);
        }
    }

    onSubmit(e) {
        e.preventDefault();

        const { runCommand } = this.props;

        runCommand(this.refs.text.value);
    }

    render() {
        const { children } = this.props;

        return (
            <div className={ container }>
                <form onSubmit={ e => this.onSubmit(e) }>
                    <input type="text" ref="text" />
                    <input className="button-primary" type="submit" value="Run" />
                </form>
                { children }
            </div>
        );
    }
}
