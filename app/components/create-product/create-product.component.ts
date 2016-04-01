import ngModuleName from './create-product.module';
import './product-list.component';
import ProductTO from './product.model';

'use strict';

const ngComponentName = 'tsfnProduct';

@at.component(ngModuleName, ngComponentName, {
    templateUrl: 'create-product/create-product.component.tpl.html',
    controller: ProductComponent,
    controllerAs: 'product',
    $routeConfig: [
        { path: '/', name: 'Empty', component: 'emptyProduct', useAsDefault: true },
        { path: '/productlist/...', name: 'List', component: 'productList' }
    ]
})
@at.inject('$log', '$scope', '$location')
export default class ProductComponent {

    public tableData = [];
    public productTO: ProductTO;
    public productList: Array<ProductTO> = [];
    constructor(private log: angular.ILogService, private scope: angular.IScope, private locationProvider: angular.ILocationService) {
        this.productTO = new ProductTO();
        log.debug(['ngComponent', ngComponentName, 'loaded'].join(' '));
    }

    public saveProduct() {
        if ( !this.productTO.isEmpty() ) {
            this.productList.push(this.productTO);
            this.productTO = new ProductTO();
        }
    }
    public isEmptyListProduct(){
        return this.productList &&  this.productList.length === 0;
    }
    public showProduct(){
        let url = this.locationProvider.path('./product/productlist');
    }

    //   public $onInit() {
    //     this.tableService.loadAllItems()
    //       .then(data => this.tableData = [].concat(data));
    //   }
}
