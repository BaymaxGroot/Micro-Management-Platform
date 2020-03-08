import {NgModule} from '@angular/core';

import {OrderRoutingModule} from './order-routing.module';
import {ListComponent} from './list/list.component';
import {AfterSaleComponent} from './after-sale/after-sale.component';
import {EvaluationComponent} from './evaluation/evaluation.component';
import {SharedModule} from "@shared";

const COMPONENTS = [
    ListComponent,
    AfterSaleComponent,
    EvaluationComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        OrderRoutingModule
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class OrderModule {
}
