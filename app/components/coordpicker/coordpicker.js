/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 29.06.15.
 * <p/>
 * © 2015 upSource GmbH, all rights reserved.
 */
'use strict';
angular.module('fsAdmin.components').directive('coordpicker', function ($q) {
    var imageUri = 'assets/images/plan.jpg';
    return {
        template: '<a class="btn btn-primary" ng-show="!showPicker" ng-click="showPicker=!showPicker"><span class="glyphicon glyphicon-map-marker">{{\'coordpicker.pick\'|translate}}</a>' +
        '<img class="coordpicker" ng-if="showPicker" ng-src="{{imageUri}}" >',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.showPicker = false;
            scope.imageUri = imageUri;
            function getImageElem() {
                return elem.children().eq(1);
            }

            function origImageSize(uri) {
                // load image from url to retreive the original size
                // this is needed later to translated coords from scaled
                // browser image to the original size of the image
                var deferred = $q.defer();
                var newImg = new Image();
                newImg.onload = function () {
                    scope.$apply(function () {
                        deferred.resolve([
                            newImg.width, newImg.height
                        ]);
                    });
                };
                newImg.src = uri;
                return deferred.promise;
            }

            var origSizeCall = origImageSize(scope.imageUri);

            function currentImageSize() {
                return [getImageElem()[0].offsetWidth,
                    getImageElem()[0].offsetHeight];
            }

            function scaleCoordsToOrigSize(origSize, coords) {
                var currentSize = currentImageSize();

                var ratios = [origSize[0] / currentSize[0],
                    origSize[1] / currentSize[1]];

                return [coords[0] * ratios[0],
                    coords[1] * ratios[1]];
            }

            function findPosition(oElement) {
                if (typeof( oElement.offsetParent ) !== 'undefined') {
                    for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent) {
                        posX += oElement.offsetLeft;
                        posY += oElement.offsetTop;
                    }
                    return [posX, posY];
                }
                else {
                    return [oElement.x, oElement.y];
                }
            }

            function findCoords(e) {
                var posX = 0, posY = 0,
                    imgPos = findPosition(getImageElem()[0]);

                if (!e) {
                    e = window.event;
                }

                if (e.pageX || e.pageY) {

                    posX = e.pageX;
                    posY = e.pageY;

                } else if (e.clientX || e.clientY) {

                    posX = e.clientX + document.body.scrollLeft +
                        document.documentElement.scrollLeft;
                    posY = e.clientY + document.body.scrollTop +
                        document.documentElement.scrollTop;
                }

                posX = posX - imgPos[0];
                posY = posY - imgPos[1];

                scope.$apply(function () {
                    origSizeCall.then(function (origSize) {
                        var scaled = scaleCoordsToOrigSize(origSize, [posX, posY]),
                            result = {
                                latitude: scaled[0],
                                longitude: scaled[1]
                            };
                        ctrl.$setViewValue(result);


                        scope.showPicker = false;
                    });
                });
            }

            // register coord-picker listener if image is opened
            var lastBound;
            scope.$watch('showPicker', function (newVal) {
                if (angular.isDefined(lastBound) && angular.isFunction(lastBound.unbind)) {
                    // remove possibly old listeners on image
                    lastBound.unbind('mousedown');
                }
                if (newVal === true) {
                    lastBound = getImageElem().bind('mousedown', findCoords);
                }
            });
        }
    };
});
