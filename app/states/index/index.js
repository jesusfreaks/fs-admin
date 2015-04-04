'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'states/index/main-view.html',
            onEnter: function (initRo, LoginService) {
                LoginService.authenticate(initRo);
            },
            resolve:{
                initRo : function(RestClient,APIBaseUrl){

                    console.log('apiBase',APIBaseUrl);
                   return RestClient.load(APIBaseUrl);
                }
            },
            views : {
                navbar: {
                    templateUrl: 'components/navbar/navbar.html'
                },
                content : {
                    templateUrl: 'states/index/index.html'
                }
            }
        });
    });
