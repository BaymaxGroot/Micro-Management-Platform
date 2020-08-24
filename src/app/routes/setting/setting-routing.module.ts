import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ParamsComponent} from "./params/params.component";
import {CarouselComponent} from "./carousel/carousel.component";
import {BlockerComponent} from "./blocker/blocker.component";
import {RechargeReductionComponent} from "./recharge-reduction/recharge-reduction.component";
import {RecommendComponent} from "./recommend/recommend.component";
import {CarriageComponent} from "./carriage/carriage.component";


const routes: Routes = [
    {path: '', redirectTo: 'params', pathMatch: 'full'},
    {path: 'params', component: ParamsComponent},
    {path: 'carousel', component: CarouselComponent},
    {path: 'blocker', component: BlockerComponent},
    {path: 'recharge-reduction', component: RechargeReductionComponent},
    {path: 'recommend', component: RecommendComponent},
    {path: 'carriage', component: CarriageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
