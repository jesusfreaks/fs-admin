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
            url: 'locations/',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                locations: function (initRo) {
                    console.log('initRessource', initRo);
                    return initRo.$$getLocations();
                }
            }
        });

        $stateProvider.state('index.locations.list', {
            url: 'list',
            templateUrl: 'states/index/location/list.html',
            controller: function ($scope, locations, $state) {
                $scope.locations = locations;

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
            controller: function ($scope, locations, $stateParams, initRo, $state, MessagesService, Helper, $modal, $log) {
                $scope.initRo = initRo;
                // locate entity to edit
                $scope.instance = locations[$stateParams.idx];
                if (!$scope.instance) {
                    $state.go('^.list');
                }

                $scope.save = function () {

                    var translations = [$scope.instance.de, $scope.instance.en];

                    // nasty directive does not allow angular to run $parsers
                    angular.forEach(translations, function (trans) {
                        if (trans.tags && trans.tags[0] && trans.tags[0].text) { // revert the nasty tag input format
                            trans.tags = trans.tags.map(function (tag) {
                                return tag.text;
                            });
                        }
                    });


                    var call;
                    if (angular.isFunction($scope.instance.$$putSelf)) {
                        call = $scope.instance.$$putSelf({data:$scope.instance}).then(function () {
                            $state.go('^.list');
                        });
                    } else { // must be a new object
                        call = initRo.$$postLocations($scope.instance).then(function (data) {
                            locations.push(data);
                            $state.go('^.list');
                        });
                    }

                    Helper.messages('location.update.success', call);
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
                            angular.forEach(locations, function (location, idx) {
                                if (location._links.self === $scope.instance._links.self) {
                                    locations.splice(idx, 1);
                                }
                            });
                            $state.go('^.list');
                        });

                        Helper.messages('location.deleted.success', call);
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                };
            }
        });
    });


