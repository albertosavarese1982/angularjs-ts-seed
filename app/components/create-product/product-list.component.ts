import ngModuleName from './create-product.module';
import './detail-product.component';
'use strict';

const ngComponentName = 'productList';

@at.component(ngModuleName, ngComponentName, {
    templateUrl: 'create-product/product-list.component.tpl.html',
    $routeConfig: [
        { path: '/', name: 'Empty', component: 'emptyProduct', useAsDefault: true },
        { path: '/details', name: 'Detail', component: 'productDetails'  },
    ]
})
@at.inject('$log')
export default class ProductListComponent {

    public tableData = [];

    constructor(
        private log: angular.ILogService) {
        log.debug(['ngComponent', ngComponentName, 'loaded'].join(' '));
    }

    //   public $onInit() {
    //     this.tableService.loadAllItems()
    //       .then(data => this.tableData = [].concat(data));
    //   }
}
