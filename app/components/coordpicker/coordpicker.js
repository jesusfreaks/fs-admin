/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 29.06.15.
 * <p/>
 * © 2015 upSource GmbH, all rights reserved.
 */
'use strict';
angular.module('fsAdmin.components').directive('coordpicker', function ($q, $timeout) {
    var imageUri = 'assets/images/plan.jpg';
    return {
        templateUrl: 'components/coordpicker/_coordpicker.html',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var defaultSize = 30;
            scope.showPicker = false;
            scope.imageUri = imageUri;

            scope.renderCoords = {};


            function getImageElem() {
                var result = elem.children().eq(0).children().eq(1);
                return result;
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

            function currentImageSize() {
                return [getImageElem()[0].offsetWidth,
                    getImageElem()[0].offsetHeight];
            }

            var origSizeCall = origImageSize(scope.imageUri);


            // init from view value,
            scope.initFromData = function () {
                var viewValue = ctrl.$viewValue;
                // ensure instance
                if (!viewValue) {
                    viewValue = { size: defaultSize};
                }
                if (!viewValue.size || viewValue.size === null) {
                    viewValue.size = defaultSize;
                }

                if (viewValue.longitude || viewValue.latitude) {
                    // need to gather calculate rendering positions
                    origSizeCall.then(function (origSize) {
                        var renderPos = scaleOriginalCoordsToRenderCoords(origSize,
                            [viewValue.latitude, viewValue.longitude],viewValue.size);
                        scope.renderCoords.posX = renderPos[0];
                        scope.renderCoords.posY = renderPos[1];
                        scope.renderCoords.size = renderPos[2];
                    });
                }
            };


            // used when coord should be rendered to smaler image
            function scaleOriginalCoordsToRenderCoords(origSize, coords,size) {
                var currentSize = currentImageSize();

                var ratios = [currentSize[0] / origSize[0],
                    currentSize[1] / origSize[1]];

                return [coords[0] * ratios[0],
                    coords[1] * ratios[1],
                    (ratios[0] + ratios[1])/2 * size];
            }

            // used when coords picked from image must be scaled to orig image size
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
                       var viewValue =  ctrl.$viewValue;
                        var scaled = scaleCoordsToOrigSize(origSize, [posX, posY]),
                            result = {
                                posX: posX,
                                posY: posY,
                                size: viewValue.size
                            };
                        viewValue.latitude = scaled[0];
                        viewValue.longitude = scaled[1];
                        scope.renderCoords = result;
                        ctrl.$setViewValue(viewValue);
                    });
                });
            }

            scope.ok = function () {

                scope.showPicker = false;
            };

            // register coord-picker listener if image is opened
            var lastBound;
            scope.$watch('showPicker', function (newVal) {
                if (angular.isDefined(lastBound) && angular.isFunction(lastBound.unbind)) {
                    // remove possibly old listeners on image
                    lastBound.unbind('mousedown');
                }
                if (newVal === true) { // SHOW
                    lastBound = getImageElem().bind('mousedown', findCoords);
                    $timeout(function () {
                        scope.initFromData();
                    }, 1)
                }
            });

            scope.$watch(
                function () {
                    return JSON.stringify(ctrl.$viewValue);
                },
                function (newVal) {
                    if (!newVal) {
                        return;
                    }
                    if (scope.showPicker === true) {
                        scope.initFromData();
                    }
                }
            );

            ctrl.$render = function () {
                if (scope.showPicker === true) {
                    scope.initFromData();
                }
            };
        }
    };
});
