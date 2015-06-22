/**
 * Simple Rest Client
 * <p/>
 * Created by Benjamin Jacob on 24.02.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.rest', ['ngResource'])
    .config(function($httpProvider){
        $httpProvider.defaults.withCredentials = true;
    })

    .config(['$resourceProvider', function ($resourceProvider) {
        // Don't strip trailing slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;

        //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }])

    .factory('RestClient', function RestClient($q, $log, $resource, APIBaseUrl, $http) {

        var linkField = '_links',
            urlProperty = 'href',
            methods = ['GET', 'POST', 'PUT', 'DELETE'];

        function _call(url, method, params) {

            var deferred = $q.defer();

            var request = {
                method: method,
                url: url,
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
            };

            angular.extend(request, params);

            $log.debug('REQUEST', request);

            $http(request).then(function (result) {
                wrapActions(result.data);
                deferred.resolve(result.data);
            }, function (error) {
                $log.error(error);
                deferred.reject(error);
            });
            return deferred.promise;
        }

        function wrapActions(resource) {
            if (angular.isArray(resource)) {
                angular.forEach(resource, function (res) {
                    wrapLinks(res);
                });
            } else {
                wrapLinks(resource);
            }
        }

        function wrapLinks(instance) {
            if (instance[linkField]) {
                angular.forEach(instance[linkField], function (field, name) {
                    angular.forEach(methods, function (method) {
                        var actionName = '$$' + method.toLowerCase() + name.substring(0, 1).toUpperCase() + name.substring(1);
                        instance[actionName] = getInvoker(field[urlProperty], method);
                    });
                });
            }
        }

        function getInvoker(url, method) {
            return function () {
                return _call(url, method, arguments[0]);
            };
        }

        return {
            load: function (url, params) {
                return _call(url, 'GET', params);
            }
        };
    });
