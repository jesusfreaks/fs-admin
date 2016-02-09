/**
 * deal with translated entities data
 */
'use strict';
angular.module('fsAdmin.components')
    .controller('bstableComponentCtrl', function ($scope, $element, $translate, $state) {

        $scope.resolve = function (entry, name) {
            var scope = $scope.$new();
            scope.item = entry;
            var resolve = name;
            if ($scope.translationKey && name.indexOf($scope.translationKey) !== -1) {
                var translationKey = $translate.use().split('_')[0];
                var parts = name.split($scope.translationKey);
                resolve = [parts[0], translationKey, parts[1]].join('.');
            }
            var resolvedItem = scope.$eval('item.' + resolve);

            // format some fields
            if (name === 'start' || name === 'end' ) {
                return moment(resolvedItem).format('DD.MM. HH:mm');
            }else if (name ==='publishDate'){
                return moment(resolvedItem).format('YYYY.DD.MM. HH:mm');
            }

            return resolvedItem;
        };

        $scope.edit = function(id){
            $state.go($scope.editable,{id:id});
        };

    })
    .directive('bstable', function ($log, $filter) {
        return {
            restrict: 'E',
            templateUrl:'components/bstable/bstable.html',
            scope: {
                data: '=',
                fields: '=',
                translationKey: '@',
                editable:'@',
                filters: '=',
                orderBy: '@'
            },

            controller: 'bstableComponentCtrl',

            link : function (scope, elem, attr) {

                var page = {
                    size : 25,
                    current : 1,
                    allItems : scope.data
                };

                var setPage = function (pageNo, page) {

                    page.totalItems = page.allItems.length;
                    page.current = pageNo;
                    var startIdx = (page.current-1) * page.size;
                    if (startIdx <= page.allItems.length) {
                        page.items = page.allItems.slice(startIdx, startIdx + page.size);
                    }
                };

                var orderPage = function(predicate, desc, page) {
                    page.desc = desc;
                    page.predicate = predicate;
                    page.allItems = $filter('orderBy')(page.allItems, predicate, desc); // order filtered data
                };

                var applyFilter = function (filters) {

                    page.allItems = scope.data;

                    angular.forEach(filters, function (filter) {

                        page.allItems = $filter('filter')(page.allItems, function (val) {
                            var expr = new RegExp(filter.value, 'i');
                            var fields = filter.field.split('.');
                            var nestedField = val;
                            for (var i = 0; i < fields.length; i++) {
                                nestedField = nestedField[fields[i]];
                            }
                            return expr.test(nestedField);
                        });
                    });

                    orderPage(page.predicate, page.desc, page);
                    setPage(1, page);
                };

                if (scope.orderBy) {

                    var orderField;

                    for (var i=0;i<scope.fields.length; i++) {
                        if (scope.fields[i] === scope.orderBy) {
                            orderField = scope.fields[i];
                            break;
                        }
                    }

                    if (orderField) {
                        orderPage(scope.fields[i], angular.isDefined(attr.orderByDesc), page);
                    }
                    else {
                        $log.error('Cannot sort table because of unknown order-by field:', scope.orderBy);
                    }

                }

                setPage(1, page);

                scope.page = page;

                scope.selectPage = function () {
                    setPage(page.current, page);
                };

                scope.order = function(predicate, desc) {
                    orderPage(predicate, desc, page);
                    setPage(1, page);
                };


                scope.$watch('filters', applyFilter, true);
            }
        };
    });

