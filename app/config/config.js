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
        });
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
                'images':{
                    isList: true,
                    type: 'image'
                },
                'markOnMap':{
                    type:'checkbox'
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
                    type: 'text', required: false, maxLength: 120
                },
                'start': {
                    type: 'datetime'
                },
                'end': {
                    type: 'datetime'
                },
                'eventCategory': {
                    type: 'dropdown', required: true,
                    opts:{
                        values:[ 'CONCERT','WORKSHOP','SEMINAR','WORSHIP','PRAYER','MISC'],
                        labelEl:'\'event.category.\'+item|translate',
                        valueEl:'item'
                    }
                },
                tags: {
                    type: 'tags'
                },
                'images':{
                    isList: true,
                    type: 'image'
                },
                'locationRef':{
                    type:'reference',
                    opts:{
                        method:'$$getLocations',
                        label:'item[language].name',
                        value:'item.identifier'
                    }
                }
            },
            translatableProperties: {
                name: {
                    type: 'text', required: true, maxLength: 80
                },
                preview: {
                    type: 'text', required: true, maxLength: 600
                },
                description: {
                    type: 'textarea', required: true, maxLength: 2600
                }
            }
        },
        news:{
            commonProperties: {
                'image':{
                    isList: false,
                    type: 'image'
                },
                'publishDate': {
                    type: 'datetime'
                }
            },
            translatableProperties: {
                title: {
                    type: 'text', required: true, maxLength: 80
                },
                preview: {
                    type: 'text', required: true, maxLength: 600
                },
                text:{
                    type: 'text', required: true, maxLength: 2600
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


