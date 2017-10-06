import {Meteor} from 'meteor/meteor';

import {executeTestsCallbacks, executeInterruptCallbacks} from './helpers';

// Expose public API
export {onTest, onInterrupt} from './helpers';

// Start is a hidden Meteor test-driver API
export function start () {

    // Perform cleanup if Meteor server restarts while the tests are running
    const cleanup = async () => {
        console.info('Meteor server restart detected, interrupting ongoing tests...');

        // Provide possibility to clean after itself
        // Error thrown over here should not stop cleanup process
        await executeInterruptCallbacks().catch(console.error);

        // Actually stop the Meteor process
        process.exit(0);
    };

    // Since Meteor doesn't provide any exit hook, listening for SIGTERM is best what we can do
    process.once('SIGTERM', cleanup);

    // Wait for app to be ready before executing the tests
    Meteor.startup(async () => {

        // Start testing and collect results
        const results = await executeTestsCallbacks();

        // We don't need to cleanup on server restart anymore as all tests complete gracefully by now
        process.removeListener('SIGTERM', cleanup);

        // In CI mode we stop Meteor, otherwise (watch mode) we leave it as is
        if (process.env.CI) {
            const errors = results.filter(result => result instanceof Error);

            // If any of the onTest callbacks returns an error then app should exit with non 0 exit code
            process.exit(errors.length > 0 ? 1 : 0);
        }
    });
}
