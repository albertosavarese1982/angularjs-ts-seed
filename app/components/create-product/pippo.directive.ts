import ngModuleName from './create-product.module';

const ngDirectiveName = 'pippo';

@at.directive(ngModuleName, ngDirectiveName, {
    restrict: 'A',
    link: (scope, elem, attrs, ctrl) => {
        console.log('ciao');
    }
})
@at.inject('$q', '$timeout')
export default class Pippo {
    constructor(
        private promise: angular.IQService,
        private timeout: angular.ITimeoutService) {
        // log.debug(['ngComponent', ngComponentName, 'loaded'].join(' '));

    }
}
