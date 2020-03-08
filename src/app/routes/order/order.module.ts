import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing.module';
import { ListComponent } from './list/list.component';
import { AfterSaleComponent } from './after-sale/after-sale.component';
import { EvaluationComponent } from './evaluation/evaluation.component';


@NgModule({
  declarations: [ListComponent, AfterSaleComponent, EvaluationComponent],
  imports: [
    CommonModule,
    OrderRoutingModule
  ]
})
export class OrderModule { }
