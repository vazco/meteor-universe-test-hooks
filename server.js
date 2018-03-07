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
    Meteor.startup(() => {
        // Start testing and collect results
        executeTestsCallbacks()
            .catch(err => {
                // Error thrown at this point means that there is something wrong with test runner.
                // We can normalize the error and pass it along as a return value
                console.error(err);
                return [err];
            })
            .then(results => {
                // We don't need to cleanup on server restart anymore as all tests are completed by now
                process.removeListener('SIGTERM', cleanup);

                // In CI mode we stop Meteor, otherwise (watch mode) we leave it as is
                if (process.env.CI && !Meteor.isPackageTest) {
                    // Error passed as a one of results means that tests did not pass
                    // and app should exit with non 0 exit code
                    const errors = results.filter(result => result instanceof Error);
                    process.exit(errors.length > 0 ? 1 : 0);
                }
            });
    });
}
