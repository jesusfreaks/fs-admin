'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.login', {
            url: '/login',
            templateUrl: 'states/index/login/login.html',
            controllerAs: 'vm',
            controller: function ($state, UserServiceFactory, MessagesService, initRo) {

                var vm = this;

                vm.credentials = {};
                vm.login = function () {

                    var userService = UserServiceFactory.create(initRo);

                    userService.authenticate(vm.credentials).then(function (authenticated) {
                        if (authenticated) {
                            vm.error = false;
                            $state.go('index.start');
                        } else {
                            vm.error = true;
                        }
                    }, function (err) {
                        MessagesService.addRestError('msg.error', err);
                    });
                };

                return vm;
            }
        });
    }).factory('UserServiceFactory', function ($rootScope) {

        var UserService = function(initRo) {

            this.authenticate = function(credentials) {

                var headers = credentials ? {Authorization : 'Basic ' +
                btoa(credentials.username + ':' + credentials.password)
                } : {};
                console.log('initRo',initRo);
                return initRo.$$getUser({headers: headers}).then(function (response) {

                    if (response.name) {
                        $rootScope.principal = response.principal;
                        return true;
                    } else {
                        delete $rootScope.principal;
                        return false;
                    }

                }, function () {
                    delete $rootScope.principal;
                    return false;
                });
            };

            this.getPrincipal = function () {
                return $rootScope.principal;
            };

            this.logout = function () {
                delete $rootScope.principal;
                return initRo.$$postLogout();
            };
        };


        var instance = null;

        return {

            create : function (initRo) {
                instance = new UserService(initRo);
                return instance;
            },

            getInstance : function () {
                return instance;
            }

        };
    });
