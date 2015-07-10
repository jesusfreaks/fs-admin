/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 19.05.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.events', {
            url: 'events/',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                events: function (initRo) {
                    return initRo.$$getEvents();
                }
            }
        });

        $stateProvider.state('index.events.list', {
            url: 'list',
            templateUrl: 'states/index/events/list.html',
            controller: function ($scope, events, $state) {
                $scope.events = events;

                $scope.query = {
                    de : {name: ''}
                };
                $scope.create = function () {
                    $state.go('index.events.update');
                };
            }
        });

        $stateProvider.state('index.events.update', {
            url: 'update/:id',
            templateUrl: 'states/index/events/edit.html',
            controller: function ($scope, events, $stateParams, initRo, $state,
                                  MessagesService, Helper, $modal, $log, DataHelper) {

                $scope.initRo = initRo;

                var lookup = {};
                for (var i = 0, len = events.length; i < len; i++) {
                    lookup[events[i].identifier] = events[i];
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
                            $state.go('^.list', {},  {reload:true});
                        });
                    } else { // must be a new object
                        DataHelper.prepareForSave($scope.instance);
                        call = initRo.$$postEvents({data:$scope.instance}).then(function (data) {
                            $state.go('^.list', {},  {reload:true});
                        });
                    }

                    Helper.messages('update.success', call);
                };

                $scope.delete = function () {

                    var eventName = $scope.instance.de.name;

                    var modalInstance = $modal.open({
                        templateUrl: 'views/confirm-delete.html',
                        controller: function ($scope) {
                            $scope.item = eventName;
                        }
                    });

                    modalInstance.result.then(function () {
                        var call = $scope.instance.$$deleteSelf().then(function () {
                            // updated events list
                            $state.go('^.list', {}, {reload:true});
                        });

                        Helper.messages('deleted.success', call);
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                };
            }
        });
    });


