import {Component, Input, OnInit} from '@angular/core';
import { environment } from '@env/environment';

@Component({
    selector: 'micro-order-item-sell',
    templateUrl: './order-item-sell.component.html',
    styleUrls: ['./order-item-sell.component.less']
})
export class OrderItemSellComponent implements OnInit {

    @Input() imgUrl = '';
    @Input() name = '';
    @Input() price = 0;
    @Input() specify = '';
    @Input() quantity = 0;

    getUrl(): string {
        return environment.ICON_URL + '/' + this.imgUrl;
    }

    constructor() {
    }

    ngOnInit() {
    }

}
