import {NgModule} from '@angular/core';

import {EnterpriseRoutingModule} from './enterprise-routing.module';
import {SharedModule} from "@shared";
import {ListComponent} from "./list/list.component";

const COMPONENTS = [
    ListComponent,
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT,
    ],
    imports: [
        SharedModule,
        EnterpriseRoutingModule
    ]
})
export class EnterpriseModule {
}
