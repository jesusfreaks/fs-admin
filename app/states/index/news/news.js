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
            url: 'news/',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                news: function (initRo) {
                    return initRo.$$getNews();
                }
            }
        });

        $stateProvider.state('index.news.list', {
            url: 'news',
            templateUrl: 'states/index/news/list.html',
            controller: function ($scope, news, $state) {
                $scope.news = news._embedded.newsRoList;
                console.log('news', $scope.news);
                $scope.create = function () {
                    var defaults = {};
                    $scope.news.push(defaults);
                    $state.go('index.news.update', {idx: $scope.news.length - 1});
                };
            }
        });


        $stateProvider.state('index.news.update', {
            url: 'update/:idx',
            templateUrl: 'states/index/news/edit.html',
            controller: function ($scope, news, $stateParams, initRo, $state,
                                  MessagesService, Helper, $modal, $log) {

                // locate entity to edit
                $scope.instance = news._embedded.newsRoList[$stateParams.idx] || {};
                console.log('instance',$scope.instance);
                $scope.initRo = initRo;

                if (!$scope.instance) {
                    $state.go('^.list');
                }

                console.log('news',news);
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
                        call = initRo.$$postNews({data:$scope.instance}).then(function (data) {
                            news._embedded.newsRoList.push(data);
                            $state.go('^.list');
                        });
                    }

                    Helper.messages('news.update.success', call);
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
                            // updated news list
                            angular.forEach(news._embedded.newsRoList, function (item, idx) {
                                if (item._links.self === $scope.instance._links.self) {
                                    news._embedded.newsRoList.splice(idx, 1);
                                }
                            });
                            $state.go('^.list');
                        });

                        Helper.messages('news.deleted.success', call);

                    }, function () {
                        $log.info('Modal dismissed at: ' + new Date());
                    });

                };
            }
        });
    });
