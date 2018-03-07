import {Meteor} from 'meteor/meteor';
import {registerCallbacks, executeCallbacks, onTest} from './helpers';

Tinytest.add('universe:test-hooks - helpers - registerCallbacks - add callbacks to queue', test => {
    const queue = [];
    const cb1 = () => {};
    const cb2 = () => {};
    const cb3 = () => {};

    // Create api function
    const addToQueue = registerCallbacks(queue);
    test.equal(typeof addToQueue, 'function');
    test.length(queue, 0);

    // Add a callback
    addToQueue(cb1);
    test.length(queue, 1);
    test.equal(queue[0], cb1);

    // Add another callbacks in order
    addToQueue(cb2);
    addToQueue(cb3);
    test.length(queue, 3);
    test.equal(queue[1], cb2);
    test.equal(queue[2], cb3);
});
Tinytest.add('universe:test-hooks - helpers - registerCallbacks - allow only functions as callbacks', test => {
    const addToQueue = registerCallbacks([]);

    test.throws(() => addToQueue(), 'You must provide a callback');
    test.throws(() => addToQueue(1), 'You must provide a callback');
    test.throws(() => addToQueue('nope'), 'You must provide a callback');
});
Tinytest.add('universe:test-hooks - helpers - registerCallbacks - allow max 1 argument for callback', test => {
    const addToQueue = registerCallbacks([]);

    // OK
    addToQueue(() => {});
    addToQueue(a => {});

    // Not OK
    test.throws(() => addToQueue((a, b) => {}), 'Callback must have 0 or 1 arguments');
    test.throws(() => addToQueue((a, b, c) => {}), 'Callback must have 0 or 1 arguments');
});

Tinytest.addAsync('universe:test-hooks - helpers - executeCallbacks - call callbacks', async test => {
    const spy = {
        a: false,
        b: false,
        c: false
    };

    const queue = [
        // Case A: Sync function
        () => {
            spy.a = true;
        },
        // Case B: Async function with callback
        done => {
            spy.b = true;
            done();
        },
        // Case C: Async function with promise
        async () => {
            spy.c = true;
        }
    ];

    await executeCallbacks(queue);

    test.isTrue(spy.a);
    test.isTrue(spy.b);
    test.isTrue(spy.c);
});
Tinytest.addAsync('universe:test-hooks - helpers - executeCallbacks - collect returned errors', async test => {
    const queue = [
        // Case A: Sync function
        () => new Error('a'),
        // Case B: Async function with callback
        done => done(new Error('b')),
        // Case C: Async function with promise
        async () => new Error('c')
    ];

    const results = await executeCallbacks(queue);
    test.length(results, 3);

    test.instanceOf(results[0], Error);
    test.equal(results[0].message, 'a');
    test.instanceOf(results[1], Error);
    test.equal(results[1].message, 'b');
    test.instanceOf(results[2], Error);
    test.equal(results[2].message, 'c');
});
Tinytest.addAsync('universe:test-hooks - helpers - executeCallbacks - catch thrown errors', (test, onComplete) => {
    const queue = [
        async () => {throw new Error('a')}
    ];

    executeCallbacks(queue)
        .then(() => {
            // This should never be called, so raise an error
            test.isTrue(false, 'Did not catch error')
        })
        .catch(err => {
            test.instanceOf(err, Error);
            test.equal(err.message, 'a');
        })
        .then(onComplete);
});

if (Meteor.isClient) {
    Tinytest.addAsync('universe:test-hooks - hidden api - runTests', (test, onComplete) => {
        import('./client').then(({runTests}) => {
            // Wait for callback to be called
            onTest(() => onComplete());
            runTests();
        });
    });
} else {
    Tinytest.addAsync('universe:test-hooks - hidden api - start', (test, onComplete) => {
        import('./server').then(({start}) => {
            // Wait for callback to be called
            onTest(() => onComplete());
            start();
        });
    });
}
