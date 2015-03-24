/**
 * comonly used filters
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
angular.module('fsAdmin.filters').filter('langRef',function($translate){
    return function(key){
        if(!key){
            key = $translate.use();
        }
        key = key.substring(0,2).toLowerCase();
        return key;
    }
});
