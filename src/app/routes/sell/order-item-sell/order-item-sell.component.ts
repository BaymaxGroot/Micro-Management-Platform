import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'micro-order-item-sell',
    templateUrl: './order-item-sell.component.html',
    styleUrls: ['./order-item-sell.component.less']
})
export class OrderItemSellComponent implements OnInit {

    @Input() imgUrl: string = '';
    @Input() name: string = '';
    @Input() price: number = 0;
    @Input() quantity: number = 0;

    constructor() {
    }

    ngOnInit() {
    }

}
