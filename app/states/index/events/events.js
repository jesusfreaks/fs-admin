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
            url: '/events',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                events: function (initRo) {
                    return initRo.$$getEvents();
                }
            },
            controller : function ($scope, FieldDefinitions, initRo) {

                $scope.filter = {
                    search: {
                        field: 'de.name',
                        value: ''
                    },
                    category : {
                        field: 'eventCategory',
                        value : ''
                    },
                    location : {
                        field: 'locationRef',
                        value : ''
                    },
                    archived : {
                        field: 'archived',
                        value: 'false'
                    }
                };

                $scope.categoryOptions=[{label:'', value:''},
                    {label:'CONCERT', value:'CONCERT'},
                    {label:'WORKSHOP', value:'WORKSHOP'},
                    {label:'SEMINAR', value:'SEMINAR'},
                    {label:'WORSHIP', value:'WORSHIP'},
                    {label:'PRAYER', value:'PRAYER'},
                    {label:'MISC', value:'MISC'}];


                $scope.locationOptions = [{label : '', value: ''}];

                var methodName = FieldDefinitions['event'].commonProperties.locationRef.opts.method;
                var fetchFn = initRo[methodName];

                fetchFn().then(function (locations) {
                    angular.forEach(locations._embedded.locationRoList, function (loc) {
                        $scope.locationOptions.push({
                            label: loc.de.name,
                            value: loc.identifier
                        });
                    });
                });

                $scope.archivedOptions = [{label : '', value: ''},
                    {label : 'ARCHIVED', value: 'true'},
                    {label : 'NOT_ARCHIVED', value: 'false'}];
            }
        });

        $stateProvider.state('index.events.list', {
            url: '/list',
            templateUrl: 'states/index/events/list.html',
            controller: function ($scope, initRo, events, $state) {

                $scope.events = events._embedded.eventRoList;

                $scope.create = function () {
                    $state.go('index.events.update');
                };

            }
        });

        $stateProvider.state('index.events.update', {
            url: '/update/:id',
            templateUrl: 'states/index/events/edit.html',
            controller: function ($scope, events, $stateParams, initRo, $state,
                                  MessagesService, Helper, $modal, $log, DataHelper) {

                $scope.initRo = initRo;

                $scope.instance = Helper.createInstance(events, $stateParams.id);

                $scope.save = function () {

                    Helper.copyTagsFromDeToEn($scope.instance);

                    var call;
                    if (angular.isFunction($scope.instance.$$putSelf)) {
                        call = $scope.instance.$$putSelf({data:$scope.instance}).then(function () {
                            events[$scope.instance.idx] = $scope.instance;
                            $state.go('^.list', {},  {reload:false});
                        });
                        Helper.messages('update.success', call);
                    } else { // must be a new object
                        DataHelper.prepareForSave($scope.instance);
                        call = initRo.$$postEvents({data:$scope.instance}).then(function (data) {
                            events.push(data);
                            $state.go('^.list', {},  {reload:false});
                        });
                        Helper.messages('save.success', call);
                    }


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
                            var idx = $scope.instance.idx;
                            events.splice(idx, 1);
                            $state.go('^.list', {}, {reload:false});
                        });

                        Helper.messages('deleted.success', call);
                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                };
            }
        });
    });


