import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoodRoutingModule } from './good-routing.module';
import { CategoryComponent } from './category/category.component';
import { ManagementComponent } from './management/management.component';
import { WantedComponent } from './wanted/wanted.component';


@NgModule({
  declarations: [CategoryComponent, ManagementComponent, WantedComponent],
  imports: [
    CommonModule,
    GoodRoutingModule
  ]
})
export class GoodModule { }
