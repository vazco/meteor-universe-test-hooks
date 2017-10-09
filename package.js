Package.describe({
    name: 'universe:test-hooks',
    version: '1.0.0-rc.1',
    summary: 'Provide test hooks for easier Meteor testing within the app',
    git: 'https://github.com/vazco/meteor-test-hooks',
    documentation: 'README.md',
    testOnly: true
});

Package.onUse(function (api) {
    api.versionsFrom('1.6-rc.5');

    api.use('ecmascript');
    api.use('promise', 'server');

    api.mainModule('server.js', 'server');
    api.mainModule('client.js', 'client');
});
