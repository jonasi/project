import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Tabs, { Tab } from 'web/common/components/tabs';
import { getCommand, getStdout, getStderr } from '../actions';

const { object, string, func } = PropTypes;

@connect(
    (state, props) => ({ command: state.getIn(['commands', 'value', props.params.id]) }),
    dispatch => bindActionCreators({ getCommand }, dispatch)
)
export default class Command extends Component {
    static propTypes = {
        params: object.isRequired,
        location: object.isRequired,
        command: object,
        getCommand: func.isRequired,
    };

    componentWillMount() {
        const { getCommand, params } = this.props;
        getCommand(params.id);
    }

    render() {
        const { command, location } = this.props;

        if (!command || !command.isSuccess()) {
            return null;
        }

        return (
            <div>
                <h5>{ command.value.id }</h5>
                <Tabs location={ location }>
                    <Tab id="stdout" label="Stdout" renderFn={ () => <Stdout id={ command.value.id } /> } />
                    <Tab id="stderr" label="Stderr" renderFn={ () => <Stderr id={ command.value.id } /> } />
                </Tabs>
            </div>
        );
    }
}

@connect(
    (state, props) => ({ stdout: state.getIn(['stdout', props.id]) }),
    dispatch => bindActionCreators({ getStdout }, dispatch)
)
class Stdout extends Component {
    static propTypes = {
        id: string.isRequired,
        stdout: object,
        getStdout: func.isRequired,
    };

    componentWillMount() {
        const { getStdout, id } = this.props;
        getStdout(id);
    }

    render() {
        const { stdout } = this.props;
        return <pre>{ stdout && stdout.value }</pre>;
    }
}

@connect(
    (state, props) => ({ stderr: state.getIn(['stderr', props.id]) }),
    dispatch => bindActionCreators({ getStderr }, dispatch)
)
class Stderr extends Component {
    static propTypes = {
        id: string.isRequired,
        stderr: object,
        getStderr: func.isRequired,
    };

    componentWillMount() {
        const { getStderr, id } = this.props;
        getStderr(id);
    }

    render() {
        const { stderr } = this.props;
        return <pre>{ stderr && stderr.value }</pre>;
    }
}
