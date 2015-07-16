'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index', {
            abstract: true,
            templateUrl: 'views/content.html',
            onEnter: function (initRo, UserServiceFactory) {
                UserServiceFactory.create(initRo).authenticate();
            },
            resolve:{
                initRo : function(RestClient,APIBaseUrl){

                    console.log('apiBase',APIBaseUrl);
                    return RestClient.load(APIBaseUrl, {withCredentials : false});
                }
            }
        });
    });
