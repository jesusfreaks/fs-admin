/**
 * Simple Rest Client
 * <p/>
 * Created by Benjamin Jacob on 24.02.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.rest', ['ngResource'])


    .config(['$resourceProvider', function ($resourceProvider) {
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }])

    .factory('RestClient', function RestClient($q, $log, $resource, APIBaseUrl, $http) {

        var linkField = '_links',
            urlProperty ='href',
            methods = ['GET','POST'];

        function tidyUri(url){
            return url.replace(/http.*?:80\//,APIBaseUrl).replace(/http:\/\/.*([/])+/g,function(v){
                console.log('v',v);
            });
        }

        function _call(url, uriParams, object, method) {
            var deferred = $q.defer(),
                headers = {
                    'Content-Type': 'application/json'
                },
                uri = tidyUri(url);

            var request = {
                method:method,
                url : uri,
                params : uriParams,
                headers: headers
            };
            if(object){
                request.data = object;
            }

            $http(request).then(function(result){
                console.log('result ',result);
                wrapActions(result.data);
                deferred.resolve(result.data);
            },function(error){
                $log.error(error);
                deferred.reject(error);
            });
            return deferred.promise;
        }

         function wrapActions(resource){
            if(angular.isArray(resource)){
                angular.forEach(resource,function(res){
                    wrapLinks(res);
                });
            }else{
                wrapLinks(resource);
            }
        }

        function wrapLinks(instance){
            if(instance[linkField]){
                angular.forEach(instance[linkField],function(field, name){
                    angular.forEach(methods,function(method){
                        var actionName = '$$'+ method.toLowerCase() + name.substring(0,1).toUpperCase() + name.substring(1);
                        instance[actionName] = getInvoker(field[urlProperty], method);
                    })
                })
            }
        }

        function getInvoker(url,method){
            return function(){
                return _call(url,arguments[0],arguments[0],method);
            }
        }

        var svc = {
            load: function (url, params) {
                return _call(url, params, undefined, 'GET');
            }
        };
        return svc;
    });
