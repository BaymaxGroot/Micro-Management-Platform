import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Lodop, STChange, STColumn, STData} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFSchema} from "@delon/form";

@Component({
    selector: 'micro-account-recharge',
    templateUrl: './account-recharge.component.html',
    styleUrls: ['./account-recharge.component.less']
})
export class AccountRechargeComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
    ) {
    }

    objectKeys = Object.keys;
    orderDateRange: Date[];

    checkboxSelectedList: STData[] = [];
    isPrintingExcel = false;
    /**
     * 账户充值订单列表
     */
    isLoadingOrderList = false;
    orderList = [];
    showOrderList = [];
    orderColumnsSetting: STColumn[] = [
        {title: '编号', index: 'check', type: 'checkbox'},
        {
            title: '订单号', index: 'order_number', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.order_number.indexOf(filter.value) !== -1
                }
            }
        },
        {title: '用户', index: 'member_name'},
        {title: '下单时间', index: 'date', type: 'date'},
        {title: '面值', index: 'face_value'},
        {title: '实际付款', index: 'pay_price'},
        {title: '支付时间', index: 'pay_time', type: 'date'},
        {
            title: '订单状态', index: 'status_desc',
            // filter: {
            //     menus: [
            //         {text: '已取消', value: '已取消'},
            //         {text: '已完成', value: '已完成'},
            //         {text: '待付款', value: '待付款'},
            //         {text: '待发货', value: '待发货'},
            //         {text: '待收货', value: '待收货'},
            //         {text: '待处理', value: '待处理'}
            //     ], fn: (filter, record) => {
            //         return !filter.value || record.status_desc == filter.value;
            //     }
            // }
        }
    ];

    ngOnInit() {
        this.loadOrderList();
    }

    /**
     * 账户充值订单列表
     */
    loadOrderList() {
        this.isLoadingOrderList = true;
        this.orderList = [];
        this._microAppHttpClient.get(Interface.LoadAccountRechargeOrderListEndPoint).subscribe((data) => {
            if (data) {
                this.orderList = data;
                this.orderList.forEach((item) => {
                    item.check = 0;
                });
                this.showOrderList = this.orderList;
                this.filterOrderAccordingDate(this.orderDateRange);
            }
            this.isLoadingOrderList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingOrderList = false;
        })
    }

    handleCheckBoxSelected(e: STChange) {
        if (e.type == 'checkbox') {
            this.checkboxSelectedList = e.checkbox;
        }
    }

    getCheckBoxSelectedIDList(): string[] {
        const pids: string[] = [];
        this.checkboxSelectedList.forEach((item) => {
            pids.push(item.order_id);
        });
        return pids;
    }

    handlePrintOrder(order_nums: string[]) {
        this.isPrintingExcel = true;

        const downloadExcelTemplate = {
            ids: order_nums.join('-')
        };

        this._microAppHttpClient.post(Interface.PrintAccountRechargeOrderEndPoint, downloadExcelTemplate).subscribe((data) => {

            this.msg.info('账户充值订单信息下载中....');

            window.open(data);

            setTimeout(() => {
                this.isPrintingExcel = false;
            }, 1000);

        }, (err) => {
            this.msg.error('下载账户充值订单信息失败，请重试!');
            this.isPrintingExcel = false;
        });

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
        this.isLoadingOrderList = true;
        setTimeout(() => {

            if (result && result.length > 0) {
                this.showOrderList = this.orderList.filter((value, index) => {
                    const temDate = (new Date(value.date)).getTime();
                    const begin = result[0].getTime();
                    const end = result[1].getTime();

                    return temDate >= begin && temDate <= end;
                })
            } else {
                this.showOrderList = this.orderList;
            }

            this.isLoadingOrderList = false;

        }, 1000);
    }

}
