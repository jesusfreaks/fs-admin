'use strict';

angular.module('fsAdmin.components')
    .controller('navbarComponentCtrl', function ($scope, $element, $translate,PossibleLanguages) {
        $scope.text = 'this is the navbar component';

        $scope.languages = PossibleLanguages;
        $scope.changeLanguage = function(key){
            $translate.use(key);
        }

    })
    .component('navbar', function () {
        return {
            controller: 'navbarComponentCtrl'
        };
    });
