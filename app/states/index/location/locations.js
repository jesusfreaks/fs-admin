/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 16.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')

    .config(function ($stateProvider) {

        /**
         * HSV to RGB color conversion
         *
         * H runs from 0 to 360 degrees
         * S and V run from 0 to 100
         *
         * Ported from the excellent java algorithm by Eugene Vishnevsky at:
         * http://www.cs.rit.edu/~ncs/color/t_convert.html
         */
        function hsb2rgb(h, s, v) {
            var r, g, b;
            var i;
            var f, p, q, t;

            // Make sure our arguments stay in-range
            h = Math.max(0, Math.min(360, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));

            // We accept saturation and value arguments from 0 to 100 because that's
            // how Photoshop represents those values. Internally, however, the
            // saturation and value are calculated from a range of 0 to 1. We make
            // That conversion here.
            s /= 100;
            v /= 100;

            if(s == 0) {
                // Achromatic (grey)
                r = g = b = v;
                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }

            h /= 60; // sector 0 to 5
            i = Math.floor(h);
            f = h - i; // factorial part of h
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));

            switch(i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

                default: // case 5:
                    r = v;
                    g = p;
                    b = q;
            }

            var rgb = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            return '#' + pad(rgb[0].toString(16),2,0) + pad(rgb[1].toString(16),2,0) + pad(rgb[2].toString(16),2,0);

        }

        function pad(n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }


        $stateProvider.state('index.locations', {
            url: '/locations',
            template: '<div ui-view></div>',
            abstract: true,
            resolve: {
                locations: function (initRo) {
                    return initRo.$$getLocations();
                }
            },
            controller : function ($scope, $filter) {
                $scope.filter = {
                    search: {
                        field: 'de.name',
                        value: ''
                    },
                    archived : {
                        field: 'archived',
                        value: 'false'
                    }
                };

                $scope.archivedOptions = [{label : '', value: ''},
                    {label : $filter('translate')('filter.archived.yes.label'), value: 'true'},
                    {label : $filter('translate')('filter.archived.no.label'), value: 'false'}];
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

                // prepare selectable colors for color-picker
                $scope.colors = [];
                for (var i = 0; i <= 359; i = i + 10) {
                    var color = hsb2rgb(i, 10, 100);
                    $scope.colors.push( color );
                }
                $scope.selectColor = function (color) {
                    // TODO: remove this use ng-click = instance.color = col in html
                    $scope.instance.color = color;
                    $scope.view.selectedColor = color;
                };

                // init data
                $scope.initRo = initRo;

                $scope.instance = Helper.createInstance(locations, $stateParams.id);

                // TODO remove this
                $scope.view = {selectedColor:$scope.instance.color};

                if (!$scope.instance.geoCoordinate) {
                    $scope.instance.geoCoordinate = {};
                }

                $scope.save = function () {

                    Helper.copyTagsFromDeToEn($scope.instance);


                    var call;
                    if (angular.isFunction($scope.instance.$$putSelf)) {
                        call = $scope.instance.$$putSelf({data:$scope.instance}).then(function () {
                            locations[$scope.instance.idx] = $scope.instance;
                            $state.go('^.list', {},  {reload:false});
                        });
                        Helper.messages('save.success', call);
                    } else { // must be a new object
                        DataHelper.prepareForSave($scope.instance);
                        call = initRo.$$postLocations({data:$scope.instance}).then(function (data) {
                            locations.push(data);
                            $state.go('^.list', {},  {reload:false});
                        });
                        Helper.messages('update.success', call);
                    }
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
                            var idx = $scope.instance.idx;
                            locations.splice(idx, 1);
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


