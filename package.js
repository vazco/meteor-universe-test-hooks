Package.describe({
    name: 'universe:test-hooks',
    version: '1.0.0',
    summary: 'Provide test hooks for easier Meteor testing within the app',
    git: 'https://github.com/vazco/meteor-test-hooks',
    documentation: 'README.md',
    testOnly: true
});

Package.onUse(function (api) {
    api.versionsFrom('1.6.1');

    api.use('ecmascript');
    api.use('promise', 'server');

    api.mainModule('server.js', 'server');
    api.mainModule('client.js', 'client');
});

Package.onTest(function (api) {
    api.use([
        'tinytest@1.1.0',
        'ecmascript',
        'universe:test-hooks'
    ]);
    api.mainModule('tests.js');
});