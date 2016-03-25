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
            port: String(window.location.port || 8080),
            path: '/'
        }
    }, angular._localConfig || {}))
    .config(function (componentFactoryProvider) {
        componentFactoryProvider.setViewPath(function (componentSnakeName, componentName) {
            return 'components/' + componentSnakeName + '/' + componentSnakeName + '.html';
        });
    })
    .config(function ($httpProvider, $showdownProvider) {
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

        $showdownProvider.setOption('parseImgDimension', true);
        $showdownProvider.setOption('strikethrough', true);
        $showdownProvider.setOption('tables', true);
    })

    // TODO wie und wo gehört das eigentlich hin? das template muss konfiguriert werden!
    .provider('ngColorPickerConfig', function(){

        var templateUrl = 'bower_components/ng-color-picker/color-picker.html';
        var defaultColors =  [
            '#7bd148',
            '#5484ed',
            '#a4bdfc',
            '#46d6db',
            '#7ae7bf',
            '#51b749',
            '#fbd75b',
            '#ffb878',
            '#ff887c',
            '#dc2127',
            '#dbadff',
            '#e1e1e1'
        ];
        this.setTemplateUrl = function(url){
            templateUrl = url;
            return this;
        };
        this.setDefaultColors = function(colors){
            defaultColors = colors;
            return this;
        };
        this.$get = function(){
            return {
                templateUrl : templateUrl,
                defaultColors: defaultColors
            }
        }
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
                },
                'archived' : {
                    type: 'checkbox'
                },
                'publishDate': {
                    type: 'datetime'
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
                    type: 'textarea', required: true, maxLength: 2600, rows: 10
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
                    type: 'datetime'//, format:'yyyy-MM-ddTHH:mm:ss' not supported anymore as we would need 4 differnt formats here to convert between inputtext (view ,model) & (timepicker model and api) values
                },
                'end': {
                    type: 'datetime'
                },
                'archived' : {
                    type: 'checkbox'
                },
                'artistWebsite' : {
                    type: 'text'
                },
                'eventCategory': {
                    type: 'dropdown', required: true,
                    opts:{
                        values:[ 'CONCERT','WORKSHOP','SEMINAR','WORSHIP','PRAYER','MISC'],
                        labelEl:'\'event.category.\'+item|translate',
                        valueEl:'item'
                    }
                },
                'images':{
                    isList: true,
                    type: 'image'
                },
                'locationRef':{
                    type:'reference',
                    required: true,
                    opts:{
                        method:'$$getLocationNames',
                        label:'item[language].name',
                        value:'item.identifier'
                    }
                },
                'publishDate': {
                    type: 'datetime'
                }
            },
            translatableProperties: {
                name: {
                    type: 'text', required: true, maxLength: 80
                },
                preview: {
                    type: 'text', required: false, maxLength: 500
                },
                description: {
                    type: 'textarea', required: true, maxLength: 10000
                },
                tags: {
                    type: 'tags'
                }
            }
        },
        news:{
            commonProperties: {
                'image':{
                    isList: false,
                    type: 'image',
                    opts:{
                        width: 1280,
                        height:720,
                        minWidth:32,
                        minHeight:18
                    }
                },
                'publishDate': {
                    type: 'datetime'
                },
                'author': {
                    type: 'text', maxLength: 80
                },
                'archived' : {
                    type: 'checkbox'
                }
            },
            translatableProperties: {
                title: {
                    type: 'text', required: true, maxLength: 80
                },
                preview: {
                    type: 'markdown', required: true, maxLength: 500
                },
                text:{
                    type: 'markdown', required: true, maxLength: 10000
                },
                tags: {
                    type: 'tags'
                }
            }
        },
        info:{
            commonProperties:{
                'archived' : {
                    type: 'checkbox'
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
                    type: 'markdown', required: true, maxLength: 500
                },
                text:{
                    type: 'markdown', required: true, maxLength: 10000
                }
            }
        }
    });

angular.module('fsAdmin').config(function ($translateProvider, PossibleLanguages) {

    $translateProvider.useStaticFilesLoader({
        prefix: 'lang/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('de');
    $translateProvider.registerAvailableLanguageKeys(PossibleLanguages, {'de*': 'de_DE', 'en*': 'en_EN'});
    moment.locale('de');
});


