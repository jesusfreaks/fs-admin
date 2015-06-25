/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.components')
    .service('CropperOpts',function($http){
        function CropperOpts(fieldName, appendToList, initResource){
            this.dataTarget = {
                fieldName : fieldName,
                appendToList : appendToList,
                initResource : initResource
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

        function dataURItoBlob(dataURI, mt) {
            var byteString = atob(dataURI.split(',')[1]);
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mt });
        }

        CropperOpts.prototype.ok = function(instance){
            // append image to list
            console.log('instance',instance);

            var fd = new FormData();
            var blob = dataURItoBlob(this.croppedImage, 'image/png'); // TODO wandelt der cropper alle Bilder nach png?

            var filename = 'file.png'; // TODO wie bekomme ich den filenamen vom input field? (ist aber eigentlich auch egal)

            fd.append('file', blob, filename);

            $http.post(this.dataTarget.initResource._links.upload.href, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined}
            })
            .success(function(res, status, headers){
                    console.log('upload complete',res);
                    console.log('Here is the location of the uploaded image:', headers('Location'));
            })
            .error(function(err){
                    console.log('upload error',err);
            });

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
            fields: '=',
            initResource:'='
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
                    //console.log('instance',instance);
                    if(instance.type === 'image'){
                        instance.opts = new CropperOpts(name,instance.isList, scope.initResource);
                    }
                });

            });
        }
    };
});

