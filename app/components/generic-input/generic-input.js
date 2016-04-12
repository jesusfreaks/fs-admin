/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.components')
    .service('DataHelper', function () {
        this.prepareForSave = function (instance) {
            if (instance.de) {
                instance.de.lang = 'de';
            }
            if (instance.en) {
                instance.en.lang = 'en';
            }
        };
    })
    .service('Referenced', function ($rootScope, langRefFilter) {
        function Referenced(opts, initRo) {
            this.initRo = initRo;
            this.fetchMethod = opts.method;
            this.labelEl = opts.label;
            this.valueEl = opts.value;
            this.data = [{
                label: '', item: null, value: ''
            }];
            //TODO: optimize to exec only if rendered
            var me = this, fetchFn = this.initRo[this.fetchMethod];
            if (!angular.isFunction(fetchFn)) {
                return;
            }

            var prom = fetchFn();
            prom.then(function (result) {
                //me.data =[];
                angular.forEach(result, function (elem) {

                    var scope = $rootScope.$new();
                    scope.item = elem;
                    scope.language = langRefFilter();
                    //console.log('valueEl ',me.valueEl,'evaled',scope.$eval(me.valueEl),'againstScope',scope);

                    me.data.push({
                        label: scope.$eval(me.labelEl),
                        item: elem,
                        value: scope.$eval(me.valueEl)
                    });
                    scope.$destroy();
                });
            });
        }
        return Referenced;
    })
    .service('CropperOpts', function ($http) {

        function remove(array, from, to) {
            var rest = array.slice((to || from) + 1 || array.length);
            array.length = from < 0 ? array.length + from : from;
            return array.push.apply(array, rest);
        }

        function CropperOpts(instance, fieldName, appendToList, initResource, options) {
            console.log('instance', instance, fieldName);
            this.dataTarget = {
                instance: instance,
                fieldName: fieldName,
                appendToList: appendToList,
                initResource: initResource
            };

            // width and height of the crop area used to define ratio and resulting image size
            this.width = 1024;
            this.height = 567;
            // min values that the rect can be set to
            this.minWidth = 32;
            this.minHeight = 18;
            this.touchRadius = 30;
            this.keepAspect = true;
            this.sourceImage = undefined;
            this.croppedImage = undefined;
            this.bounds = {
                top: 0, left: 0, right: 0, bottom: 0
            };
            angular.extend(this, options);
        }

        CropperOpts.prototype.removeImageAtIdx = function (idx) {
            if (angular.isArray(this.dataTarget.instance[this.dataTarget.fieldName])) {
                remove(this.dataTarget.instance[this.dataTarget.fieldName], idx);
            } else {
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
            return new Blob([ab], {type: mt});
        }

        CropperOpts.prototype.ok = function (instance) {
            var me = this;
            // append image to list
            var fd = new FormData();

            // thats not the angular way... aber keine Ahnung, wie ich sonst an den Filenamen komme ...
            var selectedFile = document.getElementById('fileUpload').files[0];
            console.log('Filename:', selectedFile.name);
            console.log('Type:', selectedFile.type);

            var blob = dataURItoBlob(this.croppedImage, selectedFile.type);

            fd.append('file', blob, selectedFile.name);

            $http.post(this.dataTarget.initResource._links.upload.href, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                })
                .success(function (res, status, headers) {
                    var url = headers('Location');
                    if (me.dataTarget.appendToList === true) {
                        if (!angular.isArray(me.dataTarget.instance[me.dataTarget.fieldName])) {
                            me.dataTarget.instance[me.dataTarget.fieldName] = [];
                        }
                        me.dataTarget.instance[me.dataTarget.fieldName].push(url);
                    } else {
                        me.dataTarget.instance[me.dataTarget.fieldName] = url;
                    }
                    me.sourceImage = undefined;
                    me.croppedImage = undefined;
                })
                .error(function (err) {
                    console.log('upload error', err);
                });

        };
        CropperOpts.prototype.cancel = function () {
            this.sourceImage = undefined;
            this.croppedImage = undefined;
        };
        return CropperOpts;
    })

    .directive('formatDateTime', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function (data) {
                    //View -> Model
                    var res;
                    if (typeof data === 'string') {
                        res = moment(data, 'YYYY-MM-DD HH:mm');
                    } else if (data !== undefined && data !== null) {
                        res = moment(data);
                    } else {
                        ngModelController.$setValidity('date', false);
                        return;
                    }
                    var result = res.format('YYYY-MM-DDTHH:mm');
                    ngModelController.$setValidity('date', true);
                    console.log('DateConverter: view->model', result);
                    return result;
                });
                ngModelController.$formatters.push(function (data) {
                    //Model -> View
                    var res;
                    if (typeof data === 'string') {
                        res = moment(data, 'YYYY-MM-DDTHH:mm');
                    }
                    else if (data !== undefined && data !== null) {
                        res = moment(data);
                    } else {
                        return undefined;
                    }
                    var result = res.format('YYYY-MM-DD HH:mm');
                    console.log('DateConverter: model->view', result);
                    return result;
                });
            }
        };
    })
    .directive('datepickerformat', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(function (data) {
                    //View -> Model
                    // normally we should get a date as input here but we also support a string
                    var res;
                    if (typeof data === 'string') {
                        res = moment(data, 'YYYY-MM-DD HH:mm');
                    } else if (data !== undefined && data !== null) {
                        res = moment(data);
                    } else {
                        // formater is undefined;
                        return undefined;
                    }
                    var result = res.format('YYYY-MM-DDTHH:mm');
                    console.log('view->model ', result);
                    return result;
                });
                ngModelController.$formatters.push(function (data) {
                    console.log(' data input', data);
                    //Model -> View
                    var res;
                    if (typeof data === 'string') {
                        res = moment(data, 'YYYY-MM-DDTHH:mm');
                    }
                    else if (data !== undefined && data !== null) {
                        res = moment(data);
                    } else {
                        console.log('use now ');
                        res = moment();
                    }
                    var result = res.toDate();
                    return result;
                });
            }
        };
    })


    .directive('genericInput', function ($translate, langRefFilter, FieldDefinitions, CropperOpts, Referenced, Config) {
        return {
            templateUrl: 'components/generic-input/generic-input.html',
            restrict: 'EA',
            scope: {
                instance: '=',
                instanceType: '@',
                fields: '=',
                initResource: '='
                // language as attrs // The language is only relevant for fields that are defined as translateable in config.js
            },
            link: function (scope, elem, attrs) {


                scope.evalEl = function (item, expression) {
                    var _scope = scope.$new();
                    _scope.item = item;
                    _scope.language = langRefFilter();
                    var result = _scope.$eval(expression);
                    _scope.$destroy();
                    return result;
                };

                scope.apiUrl = Config.API.protocol + '://' + Config.API.host + ':' + Config.API.port;

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
                    if (name === '') {// add an empty definition that will render as space only
                        scope.definitions.push({type: 'empty', name: 'empty'});
                        return;
                    }

                    angular.forEach(definitions, function (instance) {
                        if (name === instance.name) {
                            scope.definitions.push(instance);
                        } else {
                            return;
                        }
                        // initialize image upload
                        if (instance.type === 'image') {
                            console.log('props', FieldDefinitions[scope.instanceType], 'instance', instance.opts);
                            instance.opts = new CropperOpts(scope.instance, instance.name,
                                instance.isList, scope.initResource, instance.opts);
                        }
                        if (instance.type === 'reference') {
                            instance.opts = new Referenced(instance.opts, scope.initResource);
                        }
                    });

                });
            }
        };
    });

