'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('root.login', {
            url: '/login',
            templateUrl: 'states/login/login.html',
            controllerAs: 'vm',
            controller: function ($state, LoginService, initRo) {

                var vm = this;

                vm.credentials = {};
                vm.login = function() {
                    LoginService.authenticate(initRo, vm.credentials).then(function(authenticated) {
                        if (authenticated) {
                            vm.error = false;
                            $state.go('root.index');
                        } else {
                            vm.error = true;
                        }
                    });
                };

                return vm;
            }
        });
    }).factory('LoginService', function ($rootScope) {

        return {

            authenticate : function(initRo, credentials) {

                var headers = credentials ? {Authorization : "Basic "
                + btoa(credentials.username + ":" + credentials.password)
                } : {};

                return initRo.$$getUser({headers: headers}).then(function (response) {
                    if (response.name) {
                        $rootScope.authenticated = true;
                    } else {
                        $rootScope.authenticated = false;
                    }

                    return $rootScope.authenticated;
                }, function () {
                    $rootScope.authenticated = false;
                    return $rootScope.authenticated;
                });
            }

        }
    });
