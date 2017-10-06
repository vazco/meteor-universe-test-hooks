import {Promise} from 'meteor/promise';

/**
 * Registered test callbacks
 * @type {function[]}
 * @private
 */
const testCallbacks = [];

/**
 * Registered interrupt callbacks
 * @type {function[]}
 * @private
 */
const interruptCallbacks = [];

/**
 * Create register new callbacks function
 * @param {[]} callbacks - callbacks to add to
 * @returns {function} - function to register new callbacks
 * @private
 */
export const registerCallbacks = callbacks => cb => {
    if (typeof cb !== 'function') {
        throw new Error('You must provide a callback');
    }
    if (cb.length > 2) {
        throw new Error('Callback must have 0 or 1 arguments');
    }
    callbacks.push(cb);
};

/**
 * Execute all registered callbacks
 * @param {[]} callbacks - callbacks to execute
 * @returns {Promise.<[]>} - promise resolved when all callbacks are done
 * @private
 */
export const executeCallbacks = callbacks => Promise.all(callbacks.map(async cb => {
    if (cb.length > 0) {
        // Done callback is used by this function - use async mode
        return new Promise(resolve => cb(resolve))
    }
    // Sync or promise based mode
    return cb();
}));

/**
 * Run code when tests start
 * @param {function} cb - callback called on start, must return a promise or call first argument when done
 * @public
 */
export const onTest = registerCallbacks(testCallbacks);

/**
 * Run code when Meteor process interrupts during tests with an option to cleanup
 * @param {function} cb - callback called before Meteor process restarts
 * @public
 */
export const onInterrupt = registerCallbacks(interruptCallbacks);

/**
 * Execute all registered onTest callbacks
 * @returns {Promise.<[]>} - promise resolved when all callbacks are done
 * @private
 */
export const executeTestsCallbacks = () => executeCallbacks(testCallbacks);

/**
 * Execute all registered onInterrupt callbacks
 * @returns {Promise.<[]>} - promise resolved when all callbacks are done
 * @private
 */
export const executeInterruptCallbacks = () => executeCallbacks(interruptCallbacks);
