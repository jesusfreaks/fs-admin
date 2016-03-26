/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 16.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin')

    .config(function ($stateProvider) {

        function hsb2rgb(hue, saturation, value) {
            hue = (parseInt(hue, 10) || 0) % 360;

            saturation = /%/.test(saturation)
                ? parseInt(saturation, 10) / 100
                : parseFloat(saturation, 10);

            value = /%/.test(value)
                ? parseInt(value, 10) / 100
                : parseFloat(value, 10);

            saturation = Math.max(0, Math.min(saturation, 1));
            value = Math.max(0, Math.min(value, 1));

            var rgb;
            if (saturation === 0) {
                return [
                    Math.round(255 * value),
                    Math.round(255 * value),
                    Math.round(255 * value)
                ];
            }

            var side = hue / 60;
            var chroma = value * saturation;
            var x = chroma * (1 - Math.abs(side % 2 - 1));
            var match = value - chroma;

            switch (Math.floor(side)) {
                case 0: rgb = [ chroma, x, 0 ]; break;
                case 1: rgb = [ x, chroma, 0 ]; break;
                case 2: rgb = [ 0, chroma, x ]; break;
                case 3: rgb = [ 0, x, chroma ]; break;
                case 4: rgb = [ x, 0, chroma ]; break;
                case 5: rgb = [ chroma, 0, x ]; break;
                default: rgb = [ 0, 0, 0 ];
            }

            rgb[0] = Math.round(255 * (rgb[0] + match));
            rgb[1] = Math.round(255 * (rgb[1] + match));
            rgb[2] = Math.round(255 * (rgb[2] + match));

            return '#' + pad(rgb[0].toString(16),2,0) + pad(rgb[1].toString(16),2,0) + pad(rgb[2].toString(16),2,0);

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

                for(var i=0; i <=255;i=i+10){
                    $scope.colors.push(hsb2rgb(i,255,30));
                }

                //$scope.colors = ['#33cc33', '#ffff00', '#ff9900', '#ff3300', '#996633', '#cc00cc', '#6699ff', '#66ffff'];

                $scope.initRo = initRo;

                $scope.instance = Helper.createInstance(locations, $stateParams.id);

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


