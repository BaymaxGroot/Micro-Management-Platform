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
        {
            title: '订单编号', index: 'order_number'
        },
        {title: '发货时间', index: 'delivery_time'},
        {title: '总价格', index: 'total_price'},
        {title: '状态', index: 'status', format: (item) => {
                switch (parseInt(item.status)) {
                    case 1:
                        return '支付完成';
                    case 0:
                        return '已取消';
                     case -6:
                        return '申请退款';
                    case -1:
                        return '申请退款';
                    case -2:
                        return '退款中';
                    case -9:
                        return '退款成功';
                    case -8:
                        return '待付款';
                    case -7:
                        return '待发货';
                }
            }},
    ];

    loadSellList() {
         this.isLoadingList = true;
        this.sellList = [];
        this._microAppHttpClient.get(Interface.SellEndPoint + '?id=' + this.settingService.user.shop_id).subscribe((data) => {
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
