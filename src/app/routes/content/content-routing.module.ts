import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ArticleComponent} from "./article/article.component";
import {SubjectComponent} from "./subject/subject.component";
import {StoreComponent} from "./store/store.component";

const routes: Routes = [
    {path: '', redirectTo: 'article', pathMatch: 'full'},
    {path: 'article', component: ArticleComponent},
    {path: 'subject', component: SubjectComponent},
    {path: 'store', component: StoreComponent}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ContentRoutingModule {
}
