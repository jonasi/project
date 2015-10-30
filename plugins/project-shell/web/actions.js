export const COMMAND_REQUEST = 'command_request';
export const COMMAND_RECEIVE = 'command_receive';

export const COMMANDS_REQUEST = 'commands_request';
export const COMMANDS_RECEIVE = 'commands_receive';

export function getHistory({ api }) {
    return dispatch => {
        dispatch({ type: COMMANDS_REQUEST });

        api.get(`/plugins/shell/api/commands`)
            .then(commands => dispatch({ type: COMMANDS_RECEIVE, commands }));
    };
}

export function runCommand({ api, args }) {
    const cid = randomId();
    args = ['sh', '-c', args];

    return dispatch => {
        dispatch({ type: COMMAND_REQUEST, args, cid });

        api.post(`/plugins/shell/api/commands`, {
            body: JSON.stringify({ args }),
        })
        .then(cmd => dispatch({ type: COMMAND_RECEIVE, cid, cmd }));
    };
}

function randomId() {
    return String(Math.random()).substr(2);
}
