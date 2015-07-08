/**
 * comonly used filters
 * <p/>
 * Created by Benjamin Jacob on 24.03.15.
 * <p/>
 */
'use strict';
angular.module('fsAdmin.filters').filter('langRef',function($translate){
    return function(key){
        if(!key){
            key = $translate.use();
        }
        key = key.substring(0,2).toLowerCase();
        return key;
    };
}).filter('highlight', function ($sce) {

    var spanOpen = '<span class="highlight">';
    var spanClose = '</span>';

    return function (value, term, field, searchField) {

        if (value && term && term.length > 1 && field === searchField) {

            var expr = new RegExp(term, 'ig');

            if (expr.test(value)) {

                var replacement = spanOpen + term + spanClose;
                var result = value.replace(expr, replacement);

                return $sce.trustAsHtml(result);
            }
        }

        return value;
    }
});
