import {NgModule} from '@angular/core';

import {GoodRoutingModule} from './good-routing.module';
import {CategoryComponent} from './category/category.component';
import {ManagementComponent} from './management/management.component';
import {WantedComponent} from './wanted/wanted.component';
import {SharedModule} from "@shared";

const COMPONENTS = [
    CategoryComponent,
    ManagementComponent,
    WantedComponent
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
