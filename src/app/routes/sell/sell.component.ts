import {Component, OnInit} from '@angular/core';
import {SettingsService} from "@delon/theme";
import {STColumn} from "@delon/abc";
import {Interface} from "../../lib/enums/interface.enum";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";

@Component({
    selector: 'micro-sell',
    templateUrl: './sell.component.html',
    styleUrls: ['./sell.component.less']
})
export class SellComponent implements OnInit {

    constructor(
        private settingService: SettingsService,
         private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
    ) {
    }

    ngOnInit() {
        this.loadSellList();
    }

    isLoadingList: boolean = false;
    sellList = [];
    sellColumnSetting: STColumn[] = [
        {title: '订单号', index: 'order_number', filter: {
            type: 'keyword',
            fn: (filter, record) => {
                return !filter.value || record.order_number.indexOf(filter.value) !== -1
            }
        }},
        {title: '用户', index: 'member_name'},
        {title: '下单时间', index: 'pay_time', type: 'date'},
        {title: '总金额', index: 'total_price'},
        {title: '运费', index: 'yun_price'},
        {
            title: '订单状态', index: 'status_desc'
        }
    ];

    loadSellList() {
         this.isLoadingList = true;
        this.sellList = [];
        // this.settingService.user.shop
        this._microAppHttpClient.get(Interface.SellEndPoint + '?id=' + this.settingService.user.shop).subscribe((data) => {
            if (data) {
                this.sellList = data;
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

}
