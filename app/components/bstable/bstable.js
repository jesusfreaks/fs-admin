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
            return scope.$eval('item.' + resolve);
        };

        $scope.edit = function(index){
            $state.go($scope.editable,{idx:index});
        };

    })
    .component('bstable', function ($filter) {
        return {
            scope: {
                data: '=',
                fields: '=',
                translationKey: '@',
                editable:'@',
                searchField: '@'
            },

            controller: 'bstableComponentCtrl',

            link : function (scope, element, attr) {

                scope.order = function(predicate) {
                    scope.desc = (scope.predicate === predicate) ? !scope.desc : false;
                    scope.predicate = predicate;
                    scope.page.allItems = $filter('orderBy')(scope.page.allItems,predicate,scope.desc);
                    scope.setPage(1);
                };

                scope.page = {
                    size : 5,
                    current : 1,
                    allItems : scope.data
                };

                scope.setPage = function (pageNo) {

                    scope.page.totalItems = scope.page.allItems.length;
                    scope.page.current = pageNo;
                    var startIdx = (scope.page.current-1) * scope.page.size;
                    if (startIdx <= scope.page.allItems.length) {
                        scope.page.items = scope.page.allItems.slice(startIdx, startIdx + scope.page.size);
                    }
                };

                scope.$watch('searchTerm', function (newVal) {
                    if (newVal) {
                        var results = $filter('filter')(scope.data,
                            function (val, idx) {
                                var expr = new RegExp(newVal, 'i');
                                var fields = scope.searchField.split('.');
                                var nestedField = val;
                                for (var i=0; i<fields.length; i++) {
                                    nestedField = nestedField[fields[i]];
                                }
                                return expr.test(nestedField);
                        });

                        scope.page.allItems = results;
                    }
                    else {
                        scope.page.allItems = scope.data;
                    }

                    scope.setPage(1);
                });

                scope.setPage(1);

            }
        };
    });

