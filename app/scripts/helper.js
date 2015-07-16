/**
 * a helper class
 * <p/>
 * Created by Benjamin Jacob on 19.05.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin').service('Helper',function(MessagesService){
    var svc = {
        messages: function(successKey,call){
            call.then(function(){
                MessagesService.success(successKey);
            },function(err){
                MessagesService.addRestError('msg.error', err);
            });
        },

        copyTagsFromDeToEn: function (instance) {

            var transDe = instance.de;

            if (transDe.tags && transDe.tags[0] && transDe.tags[0].text) { // revert the nasty tag input format
                transDe.tags = transDe.tags.map(function (tag) {
                    return tag.text;
                });
            }

            instance.en.tags = [];
            instance.en.tags = angular.copy(transDe.tags);
            console.log(instance.en.tags);
        }
    };

    return svc;
});
