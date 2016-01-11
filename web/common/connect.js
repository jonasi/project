import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PropTypes } from 'react';

export default function(mapStateToProps, actionNames = []) {
    return function(Comp) {
        const Wrapped = connect(mapStateToProps)(Comp);

        class Connected extends Wrapped {
            constructor(props, context) {
                super(props, context);

                const { dispatch } = this.store;
                const { actions } = context;

                const bound = {};

                actionNames.forEach(k => bound[k] = actions[k].bind(actions));
                this.actions = bindActionCreators(bound, dispatch);
            }

            updateMergedProps() {
                super.updateMergedProps();

                Object.assign(this.mergedProps, this.actions);
            }
        }

        Connected.contextTypes.actions = PropTypes.object.isRequired;

        return Connected;
    };
}
