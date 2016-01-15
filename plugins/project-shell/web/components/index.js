import { shell } from './index.css';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { getHistory } from '../actions';

import Link from 'web/common/components/link';

const { func, object } = PropTypes;

@connect(
    state => ({ commands: state.get('commands') }),
    dispatch => bindActionCreators({ getHistory }, dispatch)
)
export default class Shell extends Component {
    static propTypes = {
        commands: object,
        getHistory: func.isRequired,
    };

    componentWillMount() {
        this.props.getHistory();
    }

    render() {
        const { commands } = this.props;

        if (!commands.isSuccess()) {
            return null;
        }

        return (
            <div className={ shell }>
                <table className="u-fill-width">
                    <tbody>{
                        commands.value.map(({ value: cmd }) => (
                            <tr key={ cmd.id }>
                                <td><Link to={ `/plugins/shell/web/commands/${ cmd.id }` }>{ moment(cmd.started_at).fromNow() }</Link></td>
                                <td><Link to={ `/plugins/shell/web/commands/${ cmd.id }` }>{ cmd.cmd } { cmd.args.join(' ') }</Link></td>
                                <td>{ cmd.state === 'inprogress' ? 'in progress' : 'exit code: ' + cmd.exit_code }</td>
                            </tr>
                        )).toList()
                    }</tbody>
                </table>
            </div>
        );
    }
}
