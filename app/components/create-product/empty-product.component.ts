import ngModuleName from './create-product.module';
'use strict';

const ngComponentName = 'emptyProduct';

@at.component(ngModuleName, ngComponentName, {
  templateUrl: 'create-product/empty-product.component.tpl.html'
})
@at.inject('$log')
export default class EmptyProductComponent  {

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
