import React, { Component, PropTypes } from 'react';
import Link from 'web/common/components/link';

const { object } = PropTypes;

export default class FormulaTable extends Component {
    static propTypes = {
        formulae: object.isRequired,
    };

    render() {
        const { formulae } = this.props;

        if (!formulae.isSuccess()) {
            return null;
        }

        return (
            <table className="u-full-width">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>URL</th>
                        <th>Installed</th>
                        <th>Stable Version</th>
                        <th />
                    </tr>
                </thead>
                <tbody>{
                    formulae.value.map(f => {
                        const version = f.installed && f.installed.length ? 
                            f.installed.map(v => v.version).join(', ') : 'not installed';

                        return (
                            <tr key={ f.name }>
                                <td><Link to={ `/plugins/brew/web/${ f.name }` }>{ f.name }</Link></td>
                                <td>{ f.desc }</td>
                                <td><a target="_blank" href={ f.homepage }>Homepage</a></td>
                                <td>{ version }</td>
                                <td>{ f.versions.stable }</td>
                                <td><button>Remove</button></td>
                            </tr>
                        );
                    })
                }</tbody>
            </table>
        );
    }
}
