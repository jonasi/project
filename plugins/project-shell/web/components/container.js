import { container } from './container.css';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

const { func, node, object } = PropTypes;

@connect(state => ({ latest: state.get('commands').first() }))
export default class ShellContainer extends Component {
    static propTypes = {
        dispatch: func.isRequired,
        children: node,
        latest: object,
    }

    static contextTypes = {
        actions: object.isRequired,
        history: object.isRequired,
    }

    componentWillReceiveProps(props) {
        const { history } = this.context;
        const { latest } = this.props;

        if (latest && props.latest && props.latest.id !== latest.id) {
            history.push(`/plugins/shell/web/commands/${ props.latest.id }`);
        }
    }

    onSubmit(e) {
        e.preventDefault();

        const { dispatch } = this.props;
        const { actions } = this.context;

        dispatch(actions.runCommand({
            args: this.refs.text.value,
        }));
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
