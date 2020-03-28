import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'micro-order-item',
    templateUrl: './order-item.component.html',
    styleUrls: ['./order-item.component.less']
})
export class OrderItemComponent implements OnInit {

    @Input() imgUrl: string = '';
    @Input() name: string = '';
    @Input() price: number = 0;
    @Input() quantity: number = 0;

    constructor() {
    }

    ngOnInit() {
    }

}
