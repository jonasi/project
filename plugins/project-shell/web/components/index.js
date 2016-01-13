import { shell } from './index.css';

import React, { Component } from 'react';
import { connect } from 'web/common/redux';
import moment from 'moment';

import Link from 'web/common/components/link';

@connect({
    state: state => ({
        pending: state.get('pending'),
        commands: state.get('commands'),
    }),
    onMount: ['getHistory'],
})
export default class Shell extends Component {
    static propTypes = {
        pending: React.PropTypes.object,
        commands: React.PropTypes.object,
    };

    render() {
        const { commands } = this.props;

        return (
            <div className={ shell }>
                <table className="u-fill-width">
                    <tbody>{
                        commands.map(cmd => (
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
