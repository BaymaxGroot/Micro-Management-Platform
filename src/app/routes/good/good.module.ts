import {NgModule} from '@angular/core';

import {GoodRoutingModule} from './good-routing.module';
import {CategoryComponent} from './category/category.component';
import {ManagementComponent} from './management/management.component';
import {SharedModule} from "@shared";
import { SpecifyComponent } from './specify/specify.component';

const COMPONENTS = [
    CategoryComponent,
    ManagementComponent,
    SpecifyComponent
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
