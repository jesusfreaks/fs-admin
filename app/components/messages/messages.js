/**
 * Created by benni on 08.10.14.
 */
'use strict';
angular.module('fsAdmin.components').service('MessagesService', function MessagesService(){

    var messages = [];

    var cnt=0;

    function _addMessage(message,description,debug,type){
        cnt++;
        messages.push({
            id: cnt,
            message: message,
            description: description,
            debug: debug,
            type: type
        });
    }

    var svc = {
        getMessage: function () {
            return messages;
        },
        removeMessage: function (message) {
            angular.forEach(messages, function (localMessage, index) {
                if (message.id === localMessage.id) {
                    messages.splice(index,1);
                }
            });
        },
        success: function (message, debug) {
            _addMessage('msg.success', message, debug, 'SUCCESS');
        },
        info: function (message, debug) {
            _addMessage('msg.info', message, debug, 'INFO');
        },
        error: function (message, debug) {
            _addMessage('msg.error', message, debug, 'ERROR');
        },
        warning: function (message, debug) {
            _addMessage('msg.warning', message, debug, 'WARNING');
        },
        addRestError: function (message, error) {
            if (error.status === 400 && error.data && error.data.violations) {
                for (var i=0; i<error.data.violations.length; i++) {
                    var violation = error.data.violations[i];
                    _addMessage(message, violation.object + (violation.field?'.'+violation.field:'') + ': ' + violation.message, null, 'ERROR');
                }
            }
            else {
                _addMessage(message, '(HTTP ' + error.status + ':' + error.statusText + ') ' + error.data.message, error.data.cause, 'ERROR');
            }

        }
    };
    return svc;
})
.directive('messages',function(MessagesService, $interval){

        return {
            restrict: 'E',
            templateUrl:'components/messages/messages.html',
            controller: function($scope){

                var maxAgeMs = 5000;

                $scope.messages = MessagesService.getMessage();

                $scope.removeMessage = function (message){
                    MessagesService.removeMessage(message);
                };


                function removeOlderThanAndUpdateTime(){
                    angular.forEach($scope.messages,function(msg){

                        // do not remove warnings or error messages
                        if (msg.type === 'WARNING' || msg.type === 'ERROR') {
                            return;
                        }

                        if (!angular.isDefined(msg.removeInSec)) {
                            msg.removeInSec = parseInt(maxAgeMs / 1000,10);
                        } else {
                            msg.removeInSec--;
                        }
                        if(msg.removeInSec<=0){
                            MessagesService.removeMessage(msg);
                        }

                    });

                }

                 if(maxAgeMs>0) {
                     var promise = $interval(function () {
                         removeOlderThanAndUpdateTime();
                     }, 1000);

                     $scope.$on('$destroy', function () {
                         // Make sure that the interval is destroyed
                         if (angular.isDefined(promise)) {
                             $interval.cancel(promise);
                         }
                     });
                 }

            }
        };
    });
