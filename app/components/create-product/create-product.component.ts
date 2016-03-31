import ngModuleName from './create-product.module';
import './product-list.component';
'use strict';

const ngComponentName = 'tsfnProduct';

@at.component(ngModuleName, ngComponentName, {
  templateUrl: 'create-product/create-product.component.tpl.html',
  $routeConfig: [
     { path: '/', name: 'Empty', component: 'emptyProduct', useAsDefault: true },
    { path: '/productlist/...', name: 'List', component: 'productList' }
  ]
})
@at.inject('$log')
export default class ProductComponent  {

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
