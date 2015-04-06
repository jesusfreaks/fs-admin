'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'states/index/index.html',
            onEnter: function (initRo, LoginService) {
                LoginService.authenticate(initRo);
            },
            resolve:{
                initRo : function(RestClient,APIBaseUrl){

                    console.log('apiBase',APIBaseUrl);
                    return RestClient.load(APIBaseUrl, {withCredentials : false});
                }
            }
        });
    });
