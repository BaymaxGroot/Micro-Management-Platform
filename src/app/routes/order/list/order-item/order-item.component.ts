import {Component, Input, OnInit} from '@angular/core';
import { environment } from '@env/environment';

@Component({
    selector: 'micro-order-item',
    templateUrl: './order-item.component.html',
    styleUrls: ['./order-item.component.less']
})
export class OrderItemComponent implements OnInit {

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
