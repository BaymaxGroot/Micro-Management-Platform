import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CategoryComponent} from "./category/category.component";
import {ManagementComponent} from "./management/management.component";
import {WantedComponent} from "./wanted/wanted.component";

const routes: Routes = [
    {path: '', redirectTo: 'category', pathMatch: 'full'},
    {path: 'category', component: CategoryComponent},
    {path: 'management', component: ManagementComponent},
    {path: 'wanted', component: WantedComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GoodRoutingModule {
}
