/**
 * deal with translated entities data
 */
'use strict';
angular.module('fsAdmin.components')
    .controller('bstableComponentCtrl', function ($scope, $element,$translate) {

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
        }

    })
    .component('bstable', function () {
        return {
            scope:{
                data:'=',
                fields:'=',
                translationKey:'@'
            },
            controller: 'bstableComponentCtrl'
        };
    });

