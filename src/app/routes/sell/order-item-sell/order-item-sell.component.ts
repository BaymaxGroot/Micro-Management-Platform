import {Component, Input, OnInit} from '@angular/core';
import { environment } from '@env/environment';

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

    getUrl(): string {
        return environment.SERVER_URL + '/static/upload/' + this.imgUrl;
    }

    constructor() {
    }

    ngOnInit() {
    }

}
