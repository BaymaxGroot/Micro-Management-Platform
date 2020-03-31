import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CategoryComponent} from "./category/category.component";
import {ManagementComponent} from "./management/management.component";

const routes: Routes = [
    {path: '', redirectTo: 'category', pathMatch: 'full'},
    {path: 'category', component: CategoryComponent},
    {path: 'management', component: ManagementComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GoodRoutingModule {
}
