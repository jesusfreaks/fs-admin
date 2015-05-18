/**
 * TODO: Documentation
 * <p/>
 * Created by Benjamin Jacob on 19.05.15.
 * <p/>
 */
'use strict'
angular.module('fsAdmin').service('Helper',function(MessagesService){
    var svc = {
        messages: function(successKey,call){
            call.then(function(){
                MessagesService.success(successKey);
            },function(err){
                MessagesService.addRestError('msg.error',err);
            });
        }
    };

    return svc;
})
