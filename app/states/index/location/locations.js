/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 16.03.15.
 * <p/>
 */
angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.locations', {
            url: 'locations/',
            templateUrl: 'states/index/location/list.html',
            resolve:{
                locations:function(initResource){
                    console.log('initREsource',initResource);
                    return initResource.$$getLocations();
                }
            },
            controller: function ($scope,locations) {
                $scope.locations = locations;
                console.log('locations',locations);
            }
        });
    });
