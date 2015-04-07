'use strict';

angular.module('fsAdmin.components')
    .controller('navbarComponentCtrl', function ($scope, $element, $translate, PossibleLanguages) {

        $scope.text = 'this is the navbar component';

        $scope.languages = PossibleLanguages;
        $scope.changeLanguage = function(key){
            $translate.use(key);
        };
    })
    .component('navbar', function (UserServiceFactory) {
        return {
            controller: 'navbarComponentCtrl',
            link : function (scope) {

                scope.getPrincipal = function () {

                    var userService = UserServiceFactory.getInstance();

                    if (userService !== null) {
                        return userService.getPrincipal();
                    }

                    return null;
                };

                scope.logout = function () {
                    UserServiceFactory.getInstance().logout();
                };

            }
        };
    });
