'use strict';

angular.module('fsAdmin.components')
    .controller('navbarComponentCtrl', function ($rootScope,$scope, $element, $translate, PossibleLanguages) {

        console.log("NAVBAR");

        $scope.text = 'this is the navbar component';

        $scope.languages = PossibleLanguages;
        $scope.changeLanguage = function(key){
            $translate.use(key);
        };

        $rootScope.logout = function () {
            console.log("LOGOUT");
            $rootScope.authenticated = false;
            initRo.$$logout();
        }

    })
    .component('navbar', function () {
        return {
            controller: 'navbarComponentCtrl'
        };
    });
