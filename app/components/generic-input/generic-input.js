/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.components')
    .service('Referenced',function($rootScope, langRefFilter){
        function Referenced(opts, initRo){
            this.initRo = initRo;
            this.fetchMethod = opts.method;
            this.labelEl = opts.label;
            this.valueEl = opts.value;
            this.data = [];
            //TODO: optimize to exec only if rendered
            console.log('init Referenced data:',this.initRo,initRo);
            var me = this, fetchFn = this.initRo[this.fetchMethod];
            console.log('self', me);
            if(!angular.isFunction(fetchFn)){
                return;
            }
            var prom = fetchFn();
            prom.then(function(result){
                me.data =[];
                angular.forEach(result,function(elem){

                    var scope = $rootScope.$new();
                    scope.item = elem;
                    scope.language = langRefFilter();
                    //console.log('valueEl ',me.valueEl,'evaled',scope.$eval(me.valueEl),'againstScope',scope);

                    me.data.push({
                        label:scope.$eval(me.labelEl ),
                        item: elem,
                        value: scope.$eval(me.valueEl )
                    });
                    scope.$destroy();
                });
                console.log('self.data',me.data);
            });
        }
        return Referenced;
    })
    .service('CropperOpts',function($http){

        function remove(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        }

        function CropperOpts(instance, fieldName, appendToList, initResource){
            this.dataTarget = {
                instance: instance,
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

        CropperOpts.prototype.removeImageAtIdx = function(idx){
            console.log('removing ',idx);
           if(angular.isArray(this.dataTarget.instance[this.dataTarget.fieldName])){
               remove(this.dataTarget.instance[this.dataTarget.fieldName],idx);
           }
        };

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
            var me = this;
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
                    console.log('instance',me.dataTarget.instance,'field name:', me.dataTarget.fieldName, headers('Location'));
                    var url = headers('Location');
                    if(me.dataTarget.appendToList===true){
                        if(!angular.isArray(me.dataTarget.instance[me.dataTarget.fieldName])){
                            me.dataTarget.instance[me.dataTarget.fieldName]=[];
                        }
                        me.dataTarget.instance[me.dataTarget.fieldName].push(url);
                    }else{
                        me.dataTarget.instance[me.dataTarget.fieldName] = url;
                    }
                    me.sourceImage = undefined;
                    me.croppedImage = undefined;
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

    .directive('formatDateTime', function ($filter) {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function(data) {
                //View -> Model
                return data;
                });
                ngModelController.$formatters.push(function(data) {
                //Model -> View
                var format = attrs.formatDateTime || 'yyyy-MM-dd HH:mm';
                return $filter('date')(data, format);
                });
            }
        };
    })


    .directive('genericInput', function ($translate, langRefFilter, FieldDefinitions, CropperOpts, Referenced) {
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
                    }else{
                        return;
                    }
                    // initialize image upload
                    if(instance.type === 'image'){
                        console.log('instance',scope.instance);
                        instance.opts = new CropperOpts(scope.instance, instance.name,
                            instance.isList, scope.initResource);
                    }
                    if(instance.type === 'reference'){
                        console.log('instance.type',instance.type,'for',instance.name);
                        instance.opts = new Referenced(instance.opts,scope.initResource);
                    }
                });

            });
        }
    };
});

