# universe:test-hooks (Meteor Test Driver)

This package is a Meteor Test Driver - special Atmosphere package intended to run in a test command, e.g.

```bash
meteor test --driver-package universe:test-hooks
```

## Installation

Package could be used directly in an app:

```bash
meteor add universe:test-hooks
```

or as an dependency of another test driver package:

```javascript
Package.onUse(api => {
    /* ... */
    api.use('universe:test-hooks');
    /* ... */
});
```

## Usage

`universe:test-hooks` are simple and minimalistic by design.

Main purpose is to unify and expose Meteor's internal test driver API's, to be used directly in application (or other packages).

There are two public methods exported by this package you can make use of:

### `onTest`

Takes a callback that will be called when app is ready to be tested.  
In this callback you should orchestrate your testing framework and run the tests.

Callback you should either return a promise or provide return value to a `done` callback, otherwise tests will never end!

If callback returns an error (or promise throws an error) then tests are considered failed, otherwise they pass.

```javascript
import {onTest} from 'meteor/universe:test-hooks';

// Promise async mode
onTest(async () => {
    const isOK = await runYourTests();
    
    if (!isOK) {
        // Return an error, don't throw it
        return new Error('Nope');
    }
});

// Callback async mode
onTest(done => {
    runYourTests()
        .then(() => done())
        .catch(error => done(error))
});
```

### `onInterrupt`

*This method is available only on the server, as there is no purpose for it on the client.*

It's quite often that tests are interrupted in the process, e.g. when Meteor restarts due to code change.
You may want to react to this situation and do some cleaning, e.g. close browser windows in case of E2E test etc.  
`onInterrupt` gives you such possibility.

API is consistent with `onTest`.  
In case of async operation you should either return a promise or call `done` when you're done.
Return values are ignored.

```javascript
import {onInterrupt} from 'meteor/universe:test-hooks';

onInterrupt(() => {
    // do some cleanup
});
```


## Examples

### With Mocha

```javascript
import {onTest} from 'meteor/universe:test-hooks';
import Mocha from 'mocha';

// Create new Mocha instance, you probably want to do it in some other file
export const mocha = new Mocha();

// Make sure that your test code (describe, it etc.) are using the same mocha instance as above
import 'your/test/suites';

onTest(done => {
    // Run the tests using Mocha
    mocha.run(errorCount => {
        // If some test fails, return any error.
        done(errorCount > 0 ? new Error() : null);
    });
});
```