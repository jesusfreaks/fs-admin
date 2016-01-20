/**
 * Festival Info
 * <p/>
 * Created by Benjamin Jacob on 20.01.16.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')
.config(function ($stateProvider) {
    $stateProvider.state('index.infos', {
        url: '/infos',
        template: '<div ui-view></div>',
        abstract: true,
        resolve: {
            infos: function (initRo) {
                console.log('initRo', initRo);
                return initRo.$$getInfos();
            }
        },
        controller: function ($scope, $filter) {
            $scope.filter = {
                search: {
                    field: 'de.title',
                    value: ''
                },
                archived : {
                    field: 'archived',
                    value: 'false'
                }
            };

            $scope.archivedOptions = [{label : '', value: ''},
                {label : $filter('translate')('filter.archived.yes.label'), value: 'true'},
                {label : $filter('translate')('filter.archived.no.label'), value: 'false'}
            ];
        }
    });

    $stateProvider.state('index.infos.list',{
        url: '/list',
            templateUrl: 'states/index/info/list.html',
            controller: function ($scope, infos, $state) {
                $scope.infos = infos;
                $scope.create = function () {
                    $state.go('index.infos.update');
                };
        }
    });

    $stateProvider.state('index.infos.update', {
        url: '/update/:id',
        templateUrl: 'states/index/info/edit.html',
        controller: function ($scope, infos, $stateParams, initRo, $state,
                              MessagesService, Helper, $modal, $log, DataHelper) {

            $scope.initRo = initRo;
            console.log('id',$stateParams.id);
            $scope.instance = Helper.createInstance(infos, $stateParams.id);

            $scope.save = function () {

                Helper.copyTagsFromDeToEn($scope.instance);

                var call;
                if (angular.isFunction($scope.instance.$$putSelf)) {
                    call = $scope.instance.$$putSelf({data:$scope.instance}).then(function () {
                        infos[$scope.instance.idx] = $scope.instance;
                        $state.go('^.list', {},  {reload:false});
                    });
                    Helper.messages('save.success', call);
                } else { // must be a new object
                    DataHelper.prepareForSave($scope.instance);
                    call = initRo.$$postInfos({data:$scope.instance}).then(function (data) {
                        infos.push(data);
                        $state.go('^.list', {},  {reload:false});
                    });
                    Helper.messages('update.success', call);
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
                        infos.splice(idx, 1);
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


