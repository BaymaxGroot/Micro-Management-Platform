import {NgModule} from '@angular/core';

import {SharedModule} from '@shared';
import {RouteRoutingModule} from './routes-routing.module';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';
import { SellComponent } from './sell/sell.component';

const COMPONENTS = [
    // passport pages
    UserLoginComponent,

    SellComponent
];
const COMPONENTS_NOROUNT = [];

@NgModule({
    imports: [
        SharedModule,
        RouteRoutingModule
    ],
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class RoutesModule {
}
