/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 19.05.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin').config(function ($stateProvider) {
    $stateProvider.state('index.events', {
        url: 'events/',
        template: '<div ui-view></div>',
        abstract: true,
        resolve: {
            events: function (initRo) {
                console.log('initRessource', initRo);
                return initRo.$$getEvents();
            }
        }
    });
    $stateProvider.state('index.events.list', {
        url: 'list',
        templateUrl: 'states/index/events/list.html',
        controller: function ($scope, events, $state) {
            $scope.events = events;
            console.log('locations', events);

            $scope.create = function () {
                var defaults = {};
                $scope.events.push(defaults);
                $state.go('index.events.update', {idx: $scope.locations.length - 1});
            };
        }
    });
    $stateProvider.state('index.events.update', {
        url: 'update/:idx',
        templateUrl: 'states/index/events/edit.html',
        controller: function ($scope, events, $stateParams, initRo, $state, MessagesService, Helper) {

            // locate entity to edit
            $scope.instance = events[$stateParams.idx];
            if (!$scope.instance) {
                $state.go('^.list');
            }

            $scope.save = function () {

                // nasty directive does not allow angular to run $parsers
                angular.forEach($scope.instance.data.translations, function (trans) {
                    if (trans.tags && trans.tags[0] && trans.tags[0].text) { // revert the nasty tag input format
                        trans.tags = trans.tags.map(function (tag) {
                            return tag.text;
                        });
                    }
                });

                var call;
                if (angular.isFunction($scope.instance.$$putSelf)) {
                    call = $scope.instance.$$putSelf($scope.instance).then(function () {
                        $state.go('^.list');
                    });
                } else { // must be a new object
                    call = initRo.$$postLocations($scope.instance).then(function (data) {
                        events.push(data);
                        $state.go('^.list');
                    });
                }

                Helper.messages('events.update.success', call);
            };

            $scope.delete = function () {
                var call = $scope.instance.$$deleteSelf().then(function () {
                    // updated locations list
                    angular.forEach(events, function (location, idx) {
                        if (location._links.self === $scope.instance._links.self) {
                            events.splice(idx, 1);
                        }
                    });
                    $state.go('^.list');
                });

                Helper.messages('events.deleted.success', call);
            };
        }
    });
});
