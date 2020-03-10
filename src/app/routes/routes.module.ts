import {NgModule} from '@angular/core';

import {SharedModule} from '@shared';
import {RouteRoutingModule} from './routes-routing.module';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';
// single pages
import {CallbackComponent} from './callback/callback.component';

// summary page
import {SummaryComponent} from './summary/summary.component';

const COMPONENTS = [
    // passport pages
    UserLoginComponent,
    // single pages
    CallbackComponent,
    // dashboard page
    SummaryComponent
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
