import {NgModule} from '@angular/core';

import {UserRoutingModule} from './user-routing.module';
import {ListComponent} from './list/list.component';
import {SharedModule} from "@shared";

const COMPONENTS = [
    ListComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        UserRoutingModule
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class UserModule {
}
