/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 * © 2015 upSource GmbH, all rights reserved.
 */
angular.module('fsAdmin.components')
    .controller('genericInputComponentCtrl', function ($scope, $translate, langRefFilter, FieldDefinitions) {
        console.log('translate',langRefFilter());
        var definitions = [];

        angular.forEach(FieldDefinitions[$scope.instanceType].commonProperties, function (definition, name) {
            if ($scope.fields.indexOf(name) !== -1) {
                definitions.push(angular.extend({}, definition, {name: name}));
            }
        });
        angular.forEach(FieldDefinitions[$scope.instanceType].translatableProperties, function (definition, name) {
            if ($scope.fields.indexOf(name) !== -1) {
                definitions.push(angular.extend({}, definition, {name: name, translatable: true}));
            }
        });

        $scope.data = {};
        $scope.data.prefix = $scope.instanceType;

        // sort depending on fields order given to directive
        $scope.definitions = [];
        angular.forEach($scope.fields,function(name){
            angular.forEach(definitions,function(instance){
               if(name === instance.name){
                   $scope.definitions.push(instance);
               }
            });
        });
    })

    .component('genericInput', function () {
        return {
            scope: {
                instance: '=',
                instanceType:'@',
                fields: '=',
                language: '@'
            },
            controller: 'genericInputComponentCtrl'
        };
});
