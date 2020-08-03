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
    @Input() specify: string = '';
    @Input() quantity: number = 0;

    getUrl(): string {
        return environment.ICON_URL + '/' + this.imgUrl;
    }

    constructor() {
    }

    ngOnInit() {
    }

}
