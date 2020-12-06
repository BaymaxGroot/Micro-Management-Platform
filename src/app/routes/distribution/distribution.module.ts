import {NgModule} from '@angular/core';

import {DistributionRoutingModule} from './distribution-routing.module';
import {ListComponent} from './list/list.component';
import {SharedModule} from "@shared";
import { StatisticsComponent } from './statistics/statistics.component';

const COMPONENTS = [
    ListComponent,
    StatisticsComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        DistributionRoutingModule
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class DistributionModule {
}
