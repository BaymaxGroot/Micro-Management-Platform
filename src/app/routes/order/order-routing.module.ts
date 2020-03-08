import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ListComponent} from "./list/list.component";
import {AfterSaleComponent} from "./after-sale/after-sale.component";
import {EvaluationComponent} from "./evaluation/evaluation.component";

const routes: Routes = [
    {path: '', redirectTo: 'list', pathMatch: 'full'},
    {path: 'list', component: ListComponent},
    {path: 'after-sale', component: AfterSaleComponent},
    {path: 'evaluation', component: EvaluationComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrderRoutingModule {
}
