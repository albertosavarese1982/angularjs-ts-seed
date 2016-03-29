import ngModuleName from './create-product.module';
import ProductController from './create-product.component';

'use strict';

const ngDirectiveName = 'tsfnProductValidator';

@at.directive(ngModuleName, ngDirectiveName, {
    restrict: 'A',
    require: ['pippo'],
    link: (scope, elem, attrs, ctrl) => {
        console.log('ciao');
        var products = ['Tachipirina', 'Sciroppo', 'Aspirina'];

        let modelController = scope['myProduct']['name'];
        modelController.$asyncValidators.product = (modelValue, viewValue) => {

            // if (modelController['$isEmpty'](modelValue)) {
            //     // consider empty model valid
            //     return ctrl['promise'].when();
            // }

           // let def = ctrl.promise.defer();

            // ctrl.timeout(function() {
            //     // Mock a delayed response
            //     if (products.indexOf(modelValue) !== -1) {
            //         // The product is available
            //         def.resolve();
            //     } else {
            //         def.reject();
            //     }

            // }, 2000);

           // return def.promise;
        };
    }
})
@at.inject('$q', '$timeout')
export default class ValidationProduct {
    constructor(
        private promise: angular.IQService,
        private timeout: angular.ITimeoutService) {
        // log.debug(['ngComponent', ngComponentName, 'loaded'].join(' '));

    }
}
