export const POST_COMMAND_REQ = 'post_command_req';
export const POST_COMMAND_RESP = 'post_command_resp';

export const GET_COMMANDS_REQ = 'get_commands_req';
export const GET_COMMANDS_RESP = 'get_commands_resp';

export const GET_COMMAND_REQ = 'get_command_req';
export const GET_COMMAND_RESP = 'get_command_resp';

export const GET_STDOUT_REQ = 'get_stdout_req';
export const GET_STDOUT_RESP = 'get_stdout_resp';

export const GET_STDERR_REQ = 'get_stderr_req';
export const GET_STDERR_RESP = 'get_stderr_resp';

export default function actions(api) {
    return {
        getHistory() {
            return dispatch => {
                dispatch({ type: GET_COMMANDS_REQ });

                api.get(`/commands`)
                    .then(commands => dispatch({ type: GET_COMMANDS_RESP, commands }));
            };
        },

        getCommand(id) {
            return dispatch => {
                dispatch({ type: GET_COMMAND_REQ });

                api.get(`/commands/${ id }`)
                    .then(command => dispatch({ type: GET_COMMAND_RESP, id, command }));
            };
        },

        runCommand({ args }) {
            const cid = randomId();
            args = ['sh', '-c', args];

            const body = JSON.stringify({ args });

            return dispatch => {
                dispatch({ type: POST_COMMAND_REQ, args, cid });

                api.post(`/commands`, { body })
                    .then(cmd => dispatch({ type: POST_COMMAND_RESP, cid, cmd }));
            };
        },

        getStdout({ id }) {
            return dispatch => {
                dispatch({ type: GET_STDOUT_REQ });

                api.get(`/commands/${ id }/stdout`)
                    .then(stdout => dispatch({ type: GET_STDOUT_RESP, id, stdout }));
            };
        },

        getStderr({ id }) {
            return dispatch => {
                dispatch({ type: GET_STDERR_REQ });

                api.get(`/commands/${ id }/stderr`)
                    .then(stderr => dispatch({ type: GET_STDERR_RESP, id, stderr }));
            };
        },
    };
}

function randomId() {
    return String(Math.random()).substr(2);
}
