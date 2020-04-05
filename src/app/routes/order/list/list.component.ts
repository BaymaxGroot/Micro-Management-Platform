import {Component, OnInit} from '@angular/core';
import {STColumn, STData} from "@delon/abc";
import {NzMessageService, NzNotificationService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFSchema} from "@delon/form";
import {Lodop, LodopService} from "@delon/abc";
import {toTitleCase} from "codelyzer/util/utils";

@Component({
    selector: 'micro-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {

    objectKeys = Object.keys;
    dateFormat = 'yyyy/MM/dd';

    constructor(
        public lodopSrv: LodopService,
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private notify: NzNotificationService
    ) {

    }

    ngOnInit() {
        this.loadOrderList();
    }

    /**
     * 订单列表
     */
    isLoadingOrderList: boolean = false;
    orderList = [];
    orderColumnsSetting: STColumn[] = [
        {title: '订单号', index: 'order_number'},
        {title: '用户', index: 'member_name'},
        {title: '下单时间', index: 'date', type: 'date'},
        {title: '总金额', index: 'total_price'},
        {
            title: '订单状态', index: 'order_status', format: (item) => {
                switch (parseInt(item.pay_status)) {
                    case 1:
                        return '支付完成';
                    case 0:
                        return '无效';
                    case -1:
                        return '申请退款';
                    case -2:
                        return '退款中';
                    case -9:
                        return '退款成功';
                    case -8:
                        return '待支付';
                    case -7:
                        return '完成支付待确认';
                }
            }
        },
        {
            title: '操作', buttons: [
                {
                    text: '修改发货地址', type: 'none', click: (record, modal, instance) => {
                        this.order_id = record.order_id;
                        this.openChangeAddress = true;
                    }
                }
            ]
        }
    ];

    /**
     * 加载订单列表
     */
    loadOrderList() {
        this.isLoadingOrderList = true;
        this.orderList = [];
        this._microAppHttpClient.get(Interface.LoadOrderListEndPoint).subscribe((data) => {
            if (data) {
                this.orderList = data;
            }
            this.isLoadingOrderList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingOrderList = false;
        })
    }

    OrderDelivery(order_id: string, shop_id: string) {
        let OrderDeliveryTemplate = {
            'order_id': parseInt(order_id),
            'shop_id': parseInt(shop_id),
            'state': 1
        };
        this._microAppHttpClient.post(Interface.ChangeOrderDeliveryStatus, OrderDeliveryTemplate).subscribe((data) => {
            this.msg.info('修改发货状态成功！');
            this.loadOrderList();
        }, (err) => {
            this.msg.error('修改发货状态失败！');
        })
    }

    /**
     * 修改发货地址
     */
    openChangeAddress: boolean = false;
    order_id: string = '';
    isChangingAddress: boolean = false;
    changeAddressSchema: SFSchema = {
        properties: {
            name: {
                type: 'string',
                title: '收件人'
            },
            phone: {
                type: 'string',
                title: '电话'
            },
            address: {
                type: 'string',
                title: '收货地址'
            }
        },
        required: ['name', 'phone', 'address']
    };

    hideChangeAddressModal() {
        this.openChangeAddress = false;
        this.loadOrderList();
    }

    disableChangeAddressSubmitButton(sf: SFComponent) {
        return !sf.valid || this.isChangingAddress;
    }

    changeAddressSubmit(value: any) {
        let changeAddressTemplate = {
            order_id: parseInt(this.order_id),
            nickname: value.name,
            mobile: value.phone,
            address: value.address
        };
        this.isChangingAddress = true;
        this._microAppHttpClient.post(Interface.ChangeOrderAddress, changeAddressTemplate).subscribe((data) => {
            this.isChangingAddress = false;
            this.openChangeAddress = false;
            this.msg.info('修改订单收货地址成功!');
            this.loadOrderList();
        }, (err) => {
            this.isChangingAddress = false;
            this.msg.error('修改订单收货地址失败!');
        })
    }

    cog: any = {
        url: 'https://localhost:8443/CLodopfuncs.js',
        printer: '',
        paper: '',
        html: '',
    };
    isPrintOrder: boolean = false;
    error = false;
    lodop: Lodop | null = null;
    pinters: any[] = [];
    papers: string[] = [];

    printing = false;

    printOrder(value: any, shop: string) {
        this.isPrintOrder = true;

        let order = value['order_number'];
        let mdate = value['date'];
        let account = value['member_name'];
        let expressinfo = value['express_info'];

        let content = '';
        let sum = 0;

        value.goods_list[shop].forEach(item => {
           content += `
               商品名称: ${item.name}
               购买数量: ${item.quantity}
               单价: ${item.price}元
           `;
        });

        let mhtml = `
            订单编号: ${order}
            下单时间: ${mdate}
            下单账户: ${account}

            ${content}

            收件人: ${expressinfo.nickname}
            电话: ${expressinfo.mobile}
            收件地址: ${expressinfo.address}
        `;

        this.cog.html = mhtml;
        this.lodopSrv.lodop.subscribe(({lodop, ok}) => {
            if (!ok) {
                this.error = true;
                return;
            }
            this.error = false;
            this.msg.success(`打印机加载成功`);
            this.lodop = lodop as Lodop;
            this.pinters = this.lodopSrv.printer;
        });
    }

    reload(options: any = {url: 'https://localhost:8443/CLodopfuncs.js'}) {
        this.pinters = [];
        this.papers = [];
        this.cog.printer = '';
        this.cog.paper = '';

        this.lodopSrv.cog = {...this.cog, ...options};
        this.error = false;
        if (options === null) this.lodopSrv.reset();
    }

    changePinter(name: string) {
        this.papers = this.lodop!.GET_PAGESIZES_LIST(name, '\n').split('\n');
    }

    print(isPrivew = false) {
        const LODOP = this.lodop as Lodop;
        LODOP.PRINT_INITA(10, 20, 810, 610, '测试C-Lodop远程打印四步骤');
        LODOP.SET_PRINTER_INDEXA(this.cog.printer);
        LODOP.SET_PRINT_PAGESIZE(0, 0, 0, this.cog.paper);
        LODOP.ADD_PRINT_TEXT(1, 1, 300, 200, '');
        LODOP.ADD_PRINT_TEXT(20, 10, '90%', '95%', this.cog.html);
        LODOP.SET_PRINT_STYLEA(0, 'ItemType', 4);
        LODOP.NewPageA();
        LODOP.ADD_PRINT_HTM(20, 10, '90%', '95%', this.cog.html);
        if (isPrivew) LODOP.PREVIEW();
        else LODOP.PRINT();
    }
}
