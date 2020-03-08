import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { ArticleComponent } from './article/article.component';
import { SubjectComponent } from './subject/subject.component';
import { StoreComponent } from './store/store.component';


@NgModule({
  declarations: [ArticleComponent, SubjectComponent, StoreComponent],
  imports: [
    CommonModule,
    ContentRoutingModule
  ]
})
export class ContentModule { }
