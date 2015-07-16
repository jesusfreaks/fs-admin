/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 29.06.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')
    .config(function ($stateProvider) {
        $stateProvider.state('index.news', {
            url: '/news',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                news: function (initRo) {
                    return initRo.$$getNews();
                }
            },
            controller: function ($scope) {
                $scope.filter = {
                    search: {
                        field: 'de.title',
                        value: ''
                    }
                };
            }
        });

        $stateProvider.state('index.news.list', {
            url: '/list',
            templateUrl: 'states/index/news/list.html',
            controller: function ($scope, news, $state) {
                $scope.news = news;
                $scope.create = function () {
                    $state.go('index.news.update');
                };
            }
        });


        $stateProvider.state('index.news.update', {
            url: '/update/:id',
            templateUrl: 'states/index/news/edit.html',
            controller: function ($scope, news, $stateParams, initRo, $state,
                                  MessagesService, Helper, $modal, $log, DataHelper) {

                $scope.initRo = initRo;

                $scope.instance = Helper.createInstance(news, $stateParams.id);

                if (!$scope.instance.identifier) {
                    $scope.instance.publishDate = moment().format('YYYY-MM-DDThh:mm:ss');
                }

                $scope.save = function () {

                    Helper.copyTagsFromDeToEn($scope.instance);

                    var call;
                    if (angular.isFunction($scope.instance.$$putSelf)) {
                        call = $scope.instance.$$putSelf({data:$scope.instance}).then(function () {
                            news[$scope.instance.idx] = $scope.instance;
                            $state.go('^.list', {},  {reload:false});
                        });
                    } else { // must be a new object
                        DataHelper.prepareForSave($scope.instance);
                        call = initRo.$$postNews({data:$scope.instance}).then(function (data) {
                            news.push(data);
                            $state.go('^.list', {},  {reload:false});
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
                            var idx = $scope.instance.idx;
                            news.splice(idx, 1);
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
