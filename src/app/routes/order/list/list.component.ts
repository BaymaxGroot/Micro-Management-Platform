import {Component, OnInit} from '@angular/core';
import {STChange, STColumn, STData} from "@delon/abc";
import {NzMessageService, NzNotificationService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFSchema} from "@delon/form";
import {Lodop, LodopService} from "@delon/abc";

@Component({
    selector: 'micro-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {

    constructor(
        public lodopSrv: LodopService,
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private notify: NzNotificationService
    ) {

    }

    objectKeys = Object.keys;
    orderDateRange: Date[];

    checkboxSelectedList: STData[] = [];
    isMultiDelivery = false;
    isPrintingExcel = false;
    /**
     * 订单列表
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
        {title: '电话', index: 'phone'},
        {title: '下单时间', index: 'date', type: 'date'},
        {title: '运费', index: 'yun_price'},
        {title: '总金额', index: 'total_price'},
        {title: '支付方式', index: 'pay_type'},
        {title: '余额抵扣', index: 'purse_price'},
        {title: '微信支付', index: 'wx_price'},
        {title: '支付时间', index: 'pay_time', type: 'date'},
        {
            title: '订单状态', index: 'status_desc', filter: {
                menus: [
                    {text: '已取消', value: '已取消'},
                    {text: '已完成', value: '已完成'},
                    {text: '待付款', value: '待付款'},
                    {text: '待发货', value: '待发货'},
                    {text: '待收货', value: '待收货'},
                    {text: '待处理', value: '待处理'},
                    {text: '已退款', value: '已退款'}
                ], fn: (filter, record) => {
                    return !filter.value || record.status_desc == filter.value;
                }
            }
        },
        {
            title: '操作', buttons: [
                {
                    text: '修改发货地址', type: 'none', click: (record, modal, instance) => {
                        this.order_id = record.order_id;
                        this.addressFormData = {
                            name: record.express_info.nickname,
                            phone: record.express_info.mobile,
                            address: record.express_info.address
                        };
                        this.openChangeAddress = true;
                    }
                },
                {
                    text: '退款', type: 'del', pop: {
                        title: '确认退款？',
                        okType: 'danger'
                      },click: (record, modal, instance) => {
                        this.handleRefund(parseInt(record.order_id));
                    },
                    iif: (item) => {
                        return item.status_desc == '待处理' || item.status_desc == '已完成' || item.status_desc == '待发货' || item.status_desc == '待收货';
                    }
                }
            ]
        }
    ];

    /**
     * 修改发货地址
     */
    openChangeAddress = false;
    order_id = '';
    isChangingAddress = false;
    addressFormData: any;
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

    cog: any = {
        url: 'https://localhost:8443/CLodopfuncs.js',
        printer: '',
        paper: '',
        html: '',
    };
    isPrintOrder = false;
    error = false;
    lodop: Lodop | null = null;
    pinters: any[] = [];
    papers: string[] = [];

    printing = false;

    ngOnInit() {
        this.orderDateRange = [
            new Date( new Date().getTime() - 30 * 24 * 60 * 60 * 1000 ),
            new Date(),
        ];
        this.loadOrderList();
    }

    /**
     * 加载订单列表
     */
    loadOrderList() {
        this.isLoadingOrderList = true;
        this.orderList = [];
        this._microAppHttpClient.get(`${Interface.LoadOrderListEndPoint}?start=${this.orderDateRange[0].getTime()}&end=${this.orderDateRange[1].getTime()}`).subscribe((data) => {
            if (data) {
                this.orderList = data;
                this.orderList.forEach((item) => {
                    item.check = 0;
                    item.expand = true;
                });
                this.showOrderList = this.orderList;
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

    handleMultiDelivery(order_nums: string[]) {
        this.isMultiDelivery = true;

        const multiDeliveryTemplate = {
            order_ids: order_nums.join('-'),
            state: 1
        };

        this._microAppHttpClient.post(Interface.ChangeMultiOrderDeliveryStatus, multiDeliveryTemplate).subscribe( (data) => {

            this.msg.info('成功批量发货!');
            this.loadOrderList();

        }, (err) => {
            this.msg.error('批量发货失败！');
        })
    }

    handlePrintOrder(order_nums: string[]) {
        this.isPrintingExcel = true;

        const downloadExcelTemplate = {
            ids: order_nums.join('-')
        };

        this._microAppHttpClient.post(Interface.PrintOrderEndPoint, downloadExcelTemplate).subscribe((data) => {

            this.msg.info('订单信息下载中....');

            window.open(data);

            setTimeout(() => {
                this.isPrintingExcel = false;
            }, 1000);

        }, (err) => {
            this.msg.error('下载订单信息失败，请重试!');
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
        this.orderDateRange = result;
        this.loadOrderList();
    }

    OrderDelivery(order_id: string, shop_id: string, state: number) {
        const OrderDeliveryTemplate = {
            'order_id': parseInt(order_id),
            'shop_id': parseInt(shop_id),
            'state': state
        };
        this._microAppHttpClient.post(Interface.ChangeOrderDeliveryStatus, OrderDeliveryTemplate).subscribe((data) => {
            this.msg.info('修改发货状态成功！');
            this.loadOrderList();
        }, (err) => {
            this.msg.error('修改发货状态失败！');
        })
    }

    hideChangeAddressModal() {
        this.openChangeAddress = false;
        this.loadOrderList();
    }

    disableChangeAddressSubmitButton(sf: SFComponent) {
        return !sf.valid || this.isChangingAddress;
    }

    changeAddressSubmit(value: any) {
        const changeAddressTemplate = {
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

    printOrder(value: any, shop: string) {
        this.isPrintOrder = true;

        const order = value.order_number;
        const mdate = value.date;
        const account = value.member_name;
        const expressinfo = value.express_info;

        let content = `
            商品名称 数量 单价 小计
        `;

        value.goods_list[shop].forEach(item => {
            content += `    ${item.name} ${item.quantity} ${item.price}元 ${item.subtotal_price}
            `;
        });

        content += `
            合计 ${value.total_price}元
        `;

        const mhtml = `
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

    handleHidePrintOrder() {
        this.isPrintOrder = false;
    }

    handleRefund(order_id: number) {
        const refundTemplate = {
            order_id
        };
        this.isLoadingOrderList = true;
        this._microAppHttpClient.post(Interface.OrderRefundEndPoint, refundTemplate).subscribe((data) => {
            this.msg.info('操作退款成功!');
            this.loadOrderList();
        }, (err) => {
            this.msg.error('操作退款失败!');
            this.isLoadingOrderList = false;
        })
    }
}
