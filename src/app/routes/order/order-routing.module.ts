import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ListComponent} from "./list/list.component";
import {EvaluateComponent} from "./evaluate/evaluate.component";
import {AccountRechargeComponent} from "./account-recharge/account-recharge.component";

const routes: Routes = [
    {path: '', redirectTo: 'list', pathMatch: 'full'},
    {path: 'list', component: ListComponent},
    {path: 'evaluate', component: EvaluateComponent},
    {path: 'account-recharge', component: AccountRechargeComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrderRoutingModule {
}
