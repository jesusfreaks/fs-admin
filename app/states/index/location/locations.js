/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 16.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.locations', {
            url: '/locations',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                locations: function (initRo) {
                    return initRo.$$getLocations();
                }
            },
            controller : function ($scope) {
                $scope.filter = {
                    search: {
                        field: 'de.name',
                        value: ''
                    }
                };
            }
        });

        $stateProvider.state('index.locations.list', {
            url: '/list',
            templateUrl: 'states/index/location/list.html',
            controller: function ($scope, locations, $state) {
                $scope.locations = locations;
                $scope.create = function () {
                    $state.go('index.locations.update');
                };
            }
        });

        $stateProvider.state('index.locations.update', {
            url: '/update/:id',
            templateUrl: 'states/index/location/edit.html',
            controller: function ($scope, locations, $stateParams, initRo, $state, MessagesService, Helper, $modal, $log, DataHelper ) {
                $scope.initRo = initRo;

                var lookup = {};
                for (var i = 0, len = locations.length; i < len; i++) {
                    lookup[locations[i].identifier] = locations[i];
                }

                if ($stateParams.id) {
                    $scope.instance = angular.copy(lookup[$stateParams.id]);

                    if (!$scope.instance) {
                        $state.go('^.list');
                    }
                }
                else {
                    $scope.instance = {};
                }

                $scope.save = function () {

                    Helper.copyTagsFromDeToEn($scope.instance);


                    var call;
                    if (angular.isFunction($scope.instance.$$putSelf)) {
                        call = $scope.instance.$$putSelf({data:$scope.instance}).then(function () {
                            $state.go('^.list', {},  {reload:true});
                        });
                    } else { // must be a new object
                        DataHelper.prepareForSave($scope.instance);
                        call = initRo.$$postLocations({data:$scope.instance}).then(function (data) {
                            $state.go('^.list', {},  {reload:true});
                        });
                    }

                    Helper.messages('update.success', call);
                };

                $scope.delete = function () {

                    var locationName = $scope.instance.de.name;

                    var modalInstance = $modal.open({
                        templateUrl: 'views/confirm-delete.html',
                        controller: function ($scope) {
                            $scope.item = locationName;
                        }
                    });

                    modalInstance.result.then(function () {
                        var call = $scope.instance.$$deleteSelf().then(function () {
                            // updated locations list
                            $state.go('^.list', {},  {reload:true});
                        });

                        Helper.messages('deleted.success', call);
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                };
            }
        });
    });


