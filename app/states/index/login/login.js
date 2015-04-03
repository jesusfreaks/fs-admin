'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.login', {
            url: '/login',
            templateUrl: 'states/index/login/login.html',
            controllerAs: 'vm',
            controller: function ($state, LoginService, initRo) {

                var vm = this;

                vm.credentials = {};
                vm.login = function() {
                    LoginService.authenticate(initRo, vm.credentials, function() {
                        if ($rootScope.authenticated) {
                            vm.error = false;
                            $state.go('index');
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

                initRo.$$getUser({headers: headers}).then(function (response) {
                    if (response.name) {
                        $rootScope.authenticated = true;
                    } else {
                        $rootScope.authenticated = false;
                    }
                }, function () {
                    $rootScope.authenticated = false;
                });
            }

        }
    });
