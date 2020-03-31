import {NgModule} from '@angular/core';

import {GoodRoutingModule} from './good-routing.module';
import {CategoryComponent} from './category/category.component';
import {ManagementComponent} from './management/management.component';
import {SharedModule} from "@shared";

const COMPONENTS = [
    CategoryComponent,
    ManagementComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        GoodRoutingModule
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class GoodModule {
}
