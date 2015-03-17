'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('error', {
            url: '/error?code',
            templateUrl: 'states/error/main-view.html',
            controller: function ($scope, $stateParams) {
                $scope.errorCode = $stateParams.code;
            }
        });
    });




