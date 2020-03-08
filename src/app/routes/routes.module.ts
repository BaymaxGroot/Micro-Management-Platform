import {NgModule} from '@angular/core';

import {SharedModule} from '@shared';
import {RouteRoutingModule} from './routes-routing.module';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';
// single pages
import {CallbackComponent} from './callback/callback.component';
import {UserLockComponent} from './passport/lock/lock.component';
import {DashboardComponent} from './dashboard/dashboard.component';

const COMPONENTS = [
    // passport pages
    UserLoginComponent,
    // single pages
    CallbackComponent,
    UserLockComponent,
    // dashboard page
    DashboardComponent
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
