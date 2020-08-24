import {NgModule} from '@angular/core';

import {SettingRoutingModule} from './setting-routing.module';
import {CarouselComponent} from './carousel/carousel.component';
import {BlockerComponent} from './blocker/blocker.component';
import {ParamsComponent} from './params/params.component';
import {SharedModule} from "@shared";
import { RechargeReductionComponent } from './recharge-reduction/recharge-reduction.component';
import { RecommendComponent } from './recommend/recommend.component';
import { CarriageComponent } from './carriage/carriage.component';


const COMPONENTS = [
    CarouselComponent,
    BlockerComponent,
    ParamsComponent,
    RechargeReductionComponent,
    RecommendComponent,
    CarriageComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        SettingRoutingModule
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class SettingModule {
}
