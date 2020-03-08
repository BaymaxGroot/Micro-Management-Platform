import {NgModule} from '@angular/core';

import {ContentRoutingModule} from './content-routing.module';
import {ArticleComponent} from './article/article.component';
import {SubjectComponent} from './subject/subject.component';
import {StoreComponent} from './store/store.component';
import {SharedModule} from "@shared";

const COMPONENTS = [
    ArticleComponent,
    SubjectComponent,
    StoreComponent
];

const COMPONENTS_NOROUNT = [];

@NgModule({
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    imports: [
        SharedModule,
        ContentRoutingModule
    ],
    entryComponents: COMPONENTS_NOROUNT
})
export class ContentModule {
}
