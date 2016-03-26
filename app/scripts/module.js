'use strict';

angular.module('fsAdmin.filters', []);
var components = angular.module('fsAdmin.components', []);
angular.componentFactory.moduleDecorator(components);

var app = angular.module('fsAdmin', [
    'kennethlynne.componentFactory',
    'fsAdmin.components',
    'ngAnimate',
    'ajoslin.promise-tracker',
    'cgBusy',
    'chieffancypants.loadingBar',
    'ui.router',
    'ui.bootstrap',
    'ngResource',
    'ngSanitize',
    'fsAdmin.rest',
    'fsAdmin.filters',
    'pascalprecht.translate',
    'ngTagsInput',
    'angular-img-cropper',
    'ng-showdown',
    'ngColorPicker',
    'ui.bootstrap.datetimepicker'
]);
angular.componentFactory.moduleDecorator(app);
