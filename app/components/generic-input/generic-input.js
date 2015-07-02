/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.components')
    .service('DataHelper',function(){
        this.prepareForSave = function(instance){
            if(instance.de) {
                instance.de.lang = 'de';
            }
            if(instance.en){
                instance.en.lang = 'en';
            }
        };
    })
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
           }else{
               this.dataTarget.instance[this.dataTarget.fieldName] = undefined;
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
            console.log('instance', instance);

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

    .directive('formatDateTime', function () {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function (data) {
                    //View -> Model
                    var res;
                    if(typeof data ==='string'){
                        res = moment(data,'YYYY-MM-DD HH:mm');
                    }else if (data !== undefined && data !== null){
                        res = moment(data);
                    }else{
                        ngModelController.$setValidity('date',false);
                        return;
                    }
                    var result =  res.format('YYYY-MM-DDTHH:mm');
                    ngModelController.$setValidity('date',true);
                    console.log('view->model ', result);
                    return result;
                });
                ngModelController.$formatters.push(function (data) {
                    //Model -> View
                    var res;
                    if(typeof data ==='string'){
                        res = moment(data,'YYYY-MM-DDTHH:mm');
                    }
                    else if (data !== undefined && data !== null){
                        res = moment(data);
                    }else{
                        return undefined;
                    }
                    var result =  res.format('YYYY-MM-DD HH:mm');
                    //console.log('model->view',result);
                    return result;
                });
            }
        };
    })
    .directive('datepickerformat', function () {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function (data) {
                    //View -> Model
                    // normally we should get a date as input here but we also support a string
                    var res;
                    if(typeof data ==='string'){
                        res = moment(data,'YYYY-MM-DD HH:mm');
                    }else if (data !== undefined && data !== null){
                        res = moment(data);
                    }else{
                        // formater is undefined;
                        return undefined;
                    }
                    var result =  res.format('YYYY-MM-DDTHH:mm');
                    console.log('view->model ', result);
                    return result;
                });
                ngModelController.$formatters.push(function (data) {
                    console.log(' data input',data);
                    //Model -> View
                    var res;
                    if(typeof data ==='string'){
                        console.log('parsing a date str');
                        res = moment(data,'YYYY-MM-DDTHH:mm');
                    }
                    else if(data !== undefined && data !== null ){
                        console.log('try to parse something');
                        res = moment(data);
                    }else{
                        console.log('use now ');
                        res = moment();
                    }
                    var result =  res.toDate();
                    console.log('model->view',result);
                    return result;
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


            scope.evalEl = function (item,expression){
                var _scope = scope.$new();
                _scope.item = item;
                _scope.language = langRefFilter();
                var result = _scope.$eval(expression);
                _scope.$destroy();
                return result;
            };



            scope.language = attrs.language;
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
                        instance.opts = new CropperOpts(scope.instance, instance.name,
                            instance.isList, scope.initResource);
                    }
                    if(instance.type === 'reference'){
                        instance.opts = new Referenced(instance.opts,scope.initResource);
                    }
                });

            });
        }
    };
});

