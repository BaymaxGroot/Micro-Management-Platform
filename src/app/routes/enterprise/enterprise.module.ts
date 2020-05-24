import {NgModule} from '@angular/core';

import {EnterpriseRoutingModule} from './enterprise-routing.module';
import {SharedModule} from "@shared";
import {ListComponent} from "./list/list.component";
import {CouponComponent} from './coupon/coupon.component';

const COMPONENTS = [
    ListComponent,
    CouponComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        EnterpriseRoutingModule
    ]
})
export class EnterpriseModule {
}
