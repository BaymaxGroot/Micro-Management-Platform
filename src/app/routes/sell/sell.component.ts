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
        setInterval( () => {
            this.loadSellList()
        }, 1000 * 60 * 2);
    }

    isLoadingList: boolean = false;
    sellList = [];
    showSellList = [];
    sellColumnSetting: STColumn[] = [
        {title: '订单号', index: 'order_number', filter: {
            type: 'keyword',
            fn: (filter, record) => {
                return !filter.value || record.order_number.indexOf(filter.value) !== -1
            }
        }},
        {title: '用户', index: 'member_name'},
        {title: '下单时间', index: 'pay_time', type: 'date'},
        {title: '运费', index: 'yun_price'},
        {title: '总金额', index: 'total_price'},
        {title: '支付时间', index: 'pay_time', type: 'date'},
        {
            title: '订单状态', index: 'status_desc', filter: {
                menus: [
                    {text: '已取消', value: '已取消'},
                    {text: '已完成', value: '已完成'},
                    {text: '待付款', value: '待付款'},
                    {text: '待发货', value: '待发货'},
                    {text: '待收货', value: '待收货'},
                    {text: '待处理', value: '待处理'}
                ], fn: (filter, record) => {
                    return !filter.value || record.status_desc == filter.value;
                }
            }
        }
    ];

    loadSellList() {
         this.isLoadingList = true;
        this.sellList = [];
        // this.settingService.user.shop
        this._microAppHttpClient.get(Interface.SellEndPoint + '?id=' + this.settingService.user.shop).subscribe((data) => {
            if (data) {
                this.sellList = data;
                this.showSellList = this.sellList;
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

    handleChangeOrderDate(type: number, result: Date[]) {
        switch (type) {
            case 0:
                if (result.length > 0) {
                    return
                } else {
                    this.filterOrderAccordingDate(result);
                }
                break;
            case 1:
                this.filterOrderAccordingDate(result);
                break;
        }
    }

    filterOrderAccordingDate(result: Date[]) {
        this.isLoadingList = true;
        setTimeout(() => {

            if (result.length > 0) {
                this.showSellList = this.sellList.filter( (value, index) => {
                    let temDate = (new Date(value['date'])).getTime();
                    let begin = result[0].getTime();
                    let end = result[1].getTime();

                    return temDate >= begin && temDate <= end;
                } )
            } else {
                this.showSellList = this.sellList;
            }

            this.isLoadingList = false;

        }, 1000);
    }

}
