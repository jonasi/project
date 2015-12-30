import { shell } from './index.css';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { runCommand, getHistory } from '../actions';

@connect(state => ({
    pending: state.get('pending'),
    commands: state.get('commands'),
}))
export default class Shell extends Component {
    static propTypes = {
        dispatch: React.PropTypes.func,
        pending: React.PropTypes.object,
        commands: React.PropTypes.object,
    }

    static contextTypes = {
        api: React.PropTypes.object,
    }

    componentWillMount() {
        const { dispatch } = this.props;
        const { api } = this.context;

        dispatch(getHistory({ api }));
    }

    onSubmit(e) {
        e.preventDefault();

        const { dispatch } = this.props;
        const { api } = this.context;

        dispatch(runCommand({ 
            api,
            args: this.refs.text.value,
        }));
    }

    render() {
        const { commands } = this.props;

        return (
            <div className={ shell }>
                <form onSubmit={ e => this.onSubmit(e) }>
                    <input type="text" ref="text" />
                    <input className="button-primary" type="submit" value="submit" />
                </form>
                <ul>{
                    commands.map(cmd => <li>{ cmd.cmd } { cmd.args.join(' ') }</li>)
                }</ul>
            </div>
        );
    }
}
