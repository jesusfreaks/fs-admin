'use strict';

angular.module('fsAdmin.components')
    .directive('navbar', function (UserServiceFactory, $state) {
        return {
            restrict: 'E',
            templateUrl:'components/navbar/navbar.html',
            controller: function ($scope, $element, $translate, PossibleLanguages) {

                $scope.text = 'this is the navbar component';

                $scope.languages = PossibleLanguages;
                $scope.changeLanguage = function(key){
                    $translate.use(key);
                    moment.locale(key);
                };
            },
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
                    $state.go('index.start');
                };

            }
        };
    });
