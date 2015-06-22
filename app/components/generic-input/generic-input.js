/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.components')
    .service('CropperOpts',function(){
        function CropperOpts(fieldName, appendToList){
            this.dataTarget = {
                fieldName : fieldName,
                appendToList : appendToList
            };
            this.width = 320;
            this.height = 113;
            this.minWidth = 320;
            this.minHeight = 113;
            this.touchRadius = 30;
            this.keepAspect = true;
            this.sourceImage = undefined;
            this.croppedImage = undefined;
            this.bounds = {
                top:0, left:0,right:0,bottom:0
            };

        }
        CropperOpts.prototype.ok = function(instance){
            // TODO: upload
            // append image to list
            console.log('instance',instance);

        };
        CropperOpts.prototype.cancel = function(){
            this.sourceImage = undefined;
            this.croppedImage = undefined;
        };
        return CropperOpts;
    })


    .directive('genericInput', function ($translate, langRefFilter, FieldDefinitions, CropperOpts) {
    return {
        templateUrl: 'components/generic-input/generic-input.html',
        restrict: 'EA',
        scope: {
            instance: '=',
            instanceType: '@',
            fields: '='
            // language as attrs
        },
        link: function (scope, elem, attrs) {
            scope.language = attrs.language;
            console.log('defining', scope.lang);
            console.log('translate', scope.language, 'as ', langRefFilter(scope.language), scope.lang);

            var definitions = [];

            angular.forEach(FieldDefinitions[scope.instanceType].commonProperties, function (definition, name) {
                if (scope.fields.indexOf(name) !== -1) {
                    definitions.push(angular.extend({}, definition, {name: name}));
                }
            });
            angular.forEach(FieldDefinitions[scope.instanceType].translatableProperties,
                function (definition, name) {
                    if (scope.fields.indexOf(name) !== -1) {
                        definitions.push(angular.extend({}, definition, {name: name, translatable: true}));
                    }
                });

            scope.prefix = scope.instanceType;

            // sort depending on fields order given to directive
            scope.definitions = [];
            angular.forEach(scope.fields, function (name) {
                if(name === ''){// add an empty definition that will render as space only
                    scope.definitions.push({type:'empty',name:'empty'});
                    return;
                }

                angular.forEach(definitions, function (instance) {
                    if (name === instance.name) {
                        scope.definitions.push(instance);
                    }
                    console.log('instance',instance);
                    if(instance.type === 'image'){
                        instance.opts = new CropperOpts(name,instance.isList);

                    }
                });

            });
        }
    };
});
