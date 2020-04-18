import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CategoryComponent} from "./category/category.component";
import {ManagementComponent} from "./management/management.component";
import {SpecifyComponent} from "./specify/specify.component";

const routes: Routes = [
    {path: '', redirectTo: 'category', pathMatch: 'full'},
    {path: 'category', component: CategoryComponent},
    {path: 'management', component: ManagementComponent},
    {path: 'specify', component: SpecifyComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GoodRoutingModule {
}
