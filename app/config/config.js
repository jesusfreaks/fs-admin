'use strict';

angular.module('fsAdmin')
    .constant('Config', angular.deepExtend({
        viewsDir: 'views/',
        componentsDir: 'components/',
        statesDir: 'states/',
        environment: 'production', //development or production
        API: {
            protocol: window.location.protocol.split(':')[0], //Use the same protocol, host and port as the UI is hosted from bu default
            host: window.location.hostname,
            port: String(window.location.port || 80),
            path: '/'
        }
    }, angular._localConfig || {}))
    .config(function (componentFactoryProvider) {
        componentFactoryProvider.setViewPath(function (componentSnakeName, componentName) {
            return 'components/' + componentSnakeName + '/' + componentSnakeName + '.html';
        })
    })
    .config(function ($httpProvider) {
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    })
    .value('cgBusyTemplateName', 'views/angular-busy/default-spinner.html')
    .factory('BaseUrl', function (Config) {
        return (Config.API.protocol + '://' + Config.API.host + ':' + Config.API.port + '/');
    })
    .factory('APIBaseUrl', function (Config) {
        return (Config.API.protocol + '://' + Config.API.host + ':' + Config.API.port + Config.API.path);
    })
    .constant('PossibleLanguages',['de_DE', 'en_EN'])

    .constant('FieldDefinitions',{
        location:{
            commonProperties: {
                'code': {
                    type: 'text', maxLength: 3, required: true
                }
            },
            translatableProperties: {
                name: {
                    type: 'text', required: true, maxLength: 80
                },
                preview: {
                    type: 'text', required: true, maxLength: 120
                },
                description: {
                    type: 'textarea', required: true, maxLength: 2600
                },
                tags: {
                    type: 'tags'
                }
            }
        },
        event:{
            commonProperties: {
                'author': {
                    type: 'text', required: true, maxLength: 80
                },
                'start': {
                    type: 'text', maxLength: 3
                },
                'end': {
                    type: 'text', maxLength: 3
                },
                'eventCategory': {
                    type: 'text', maxLength: 3, required: true
                }
            },
            translatableProperties: {
                name: {
                    type: 'text', required: true, maxLength: 80
                },
                preview: {
                    type: 'text', required: true, maxLength: 120
                },
                description: {
                    type: 'textarea', required: true, maxLength: 2600
                },
                tags: {
                    type: 'tags'
                }
            }
        }
    });

angular.module('fsAdmin').config(function ($translateProvider, PossibleLanguages) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'lang/',
        suffix: '.json'
    });
    $translateProvider.determinePreferredLanguage();
    $translateProvider.registerAvailableLanguageKeys(PossibleLanguages, {'de*': 'de_DE', 'en*': 'en_EN'});
});


