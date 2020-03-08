import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DistributionRoutingModule } from './distribution-routing.module';
import { LiatComponent } from './liat/liat.component';


@NgModule({
  declarations: [LiatComponent],
  imports: [
    CommonModule,
    DistributionRoutingModule
  ]
})
export class DistributionModule { }
