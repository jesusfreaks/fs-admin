'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('root.index', {
            url: '/',
            templateUrl: 'states/index/index.html'
        });
    });
