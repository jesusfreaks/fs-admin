'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.start', {
            url: '/',
            templateUrl: 'states/index/start/start.html'
        });
    });
