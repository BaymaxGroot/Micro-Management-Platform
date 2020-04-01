import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ParamsComponent} from "./params/params.component";
import {CarouselComponent} from "./carousel/carousel.component";
import {BlockerComponent} from "./blocker/blocker.component";


const routes: Routes = [
    {path: '', redirectTo: 'params', pathMatch: 'full'},
    {path: 'params', component: ParamsComponent},
    {path: 'carousel', component: CarouselComponent},
    {path: 'blocker', component: BlockerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
