import React, { Component } from 'react';
import { connect } from 'web/common/redux';
import Tabs, { Tab } from 'web/common/components/tabs';

@connect({
    state: (state, props) => ({ command: state.getIn(['commands', props.params.id]) }),
    onMount: (actions, props) => actions.getCommand(props.params.id),
})
export default class Command extends Component {
    static propTypes = {
        params: React.PropTypes.object.isRequired,
        command: React.PropTypes.object,
    };

    render() {
        const { command } = this.props;

        if (!command) {
            return null;
        }

        return (
            <div>
                <h5>{ command.id }</h5>
                <Tabs>
                    <Tab id="stdout" label="Stdout" renderFn={ () => <Stdout id={ command.id } /> } />
                    <Tab id="stderr" label="Stderr" renderFn={ () => <Stderr id={ command.id } /> } />
                </Tabs>
            </div>
        );
    }
}

@connect({
    state: (state, props) => ({ stdout: state.getIn(['stdout', props.id]) }),
    onMount: (actions, props) => actions.getStdout(props.id),
})
class Stdout extends Component {
    static propTypes = {
        id: React.PropTypes.string,
        stdout: React.PropTypes.string,
    };

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout }</pre>;
    }
}

@connect({
    state: (state, props) => ({ stderr: state.getIn(['stderr', props.id]) }),
    onMount: (actions, props) => actions.getStderr(props.id),
})
class Stderr extends Component {
    static propTypes = {
        id: React.PropTypes.string,
        stderr: React.PropTypes.string,
    };

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr }</pre>;
    }
}
