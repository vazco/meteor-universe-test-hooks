import {Meteor} from 'meteor/meteor';

import {executeTestsCallbacks} from './helpers';

// Expose public API
export {onTest} from './helpers';
export const onInterrupt = () => {
    throw new Error('onInterrupt is not available on the client');
};

// This function is required for Meteor test-driver API
export const runTests = () => Meteor.startup(executeTestsCallbacks);
