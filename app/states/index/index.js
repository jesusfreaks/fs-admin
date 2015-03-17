'use strict';

angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index', {
            url: '/',
            templateUrl: 'states/index/main-view.html',
            resolve:{
                initResource : function(RestClient,APIBaseUrl){

                    console.log('apiBase',APIBaseUrl);
                   return RestClient.load(APIBaseUrl);
                }
            },
            controller: function ($scope,initResource) {

            }
        });
    });
