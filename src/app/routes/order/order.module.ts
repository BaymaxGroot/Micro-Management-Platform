import {NgModule} from '@angular/core';

import {OrderRoutingModule} from './order-routing.module';
import {ListComponent} from './list/list.component';
import {SharedModule} from "@shared";
import { OrderItemComponent } from './list/order-item/order-item.component';

const COMPONENTS = [
    ListComponent,

    //
    OrderItemComponent
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
