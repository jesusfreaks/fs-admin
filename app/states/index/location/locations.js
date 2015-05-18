/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 16.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.locations',{
            url:'locations/',
            template:'<div ui-view></div>',
            abstract: true,
            resolve:{
                locations:function(initRo){
                    console.log('initRessource',initRo);
                    return initRo.$$getLocations();
                }
            }
        });

        $stateProvider.state('index.locations.list', {
            url: 'list',
            templateUrl: 'states/index/location/list.html',
            controller: function ($scope, locations, $state) {
                $scope.locations = locations;
                console.log('locations', locations);

                $scope.create = function () {
                    var defaults = {};
                    $scope.locations.push(defaults);
                    $state.go('index.locations.update', {idx: $scope.locations.length - 1});
                };
            }
        });

        $stateProvider.state('index.locations.update', {
            url: 'update/:idx',
            templateUrl: 'states/index/location/edit.html',
            controller: function ($scope, locations, $stateParams) {
                $scope.instance = locations[$stateParams.idx];
                $scope.save=function(){
                    $scope.instance.$$postSelf();
                };
            }

        });
    });


