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

            if (name === 'start' || name === 'end') {
                return moment(resolvedItem).format('D.MM. h:mm');
            }

            return resolvedItem;
        };

        $scope.edit = function(id){
            $state.go($scope.editable,{id:id});
        };

    })
    .component('bstable', function ($filter) {
        return {
            scope: {
                data: '=',
                fields: '=',
                translationKey: '@',
                editable:'@',
                searchField: '@',
                filterField: '@',
                filterOptions: '='
            },

            controller: 'bstableComponentCtrl',

            link : function (scope) {

                var page = {
                    size : 25,
                    current : 1,
                    allItems : scope.data,
                    predicate : scope.searchField,
                    desc : false
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

                orderPage(scope.searchField, false, page);
                setPage(1, page);

                scope.page = page;

                scope.selectPage = function () {
                    setPage(page.current, page);
                };

                scope.order = function(predicate, desc) {
                    orderPage(predicate, desc, page);
                    setPage(1, page);
                };

                var filterObj =  {};

                scope.$watch('filterBy', function (newVal, oldVal) {

                    if (!newVal && !oldVal) {
                        return;
                    }

                    return filterBy(scope.filterField, newVal.value);
                });

                scope.$watch('searchTerm', function (newVal, oldVal) {

                    if (!newVal && !oldVal) {
                        return;
                    }

                    return filterBy(scope.searchField, newVal);
                });

                var filterBy = function (field, newVal)  {

                    if (newVal.length > 1) {
                        filterObj[field] = {field:field, value:newVal};
                    }
                    else {
                        delete filterObj[field];
                    }

                    applyFilter();
                };

                var applyFilter = function () {

                    page.allItems = scope.data;

                    angular.forEach(filterObj, function (filter) {
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
            }
        };
    });

