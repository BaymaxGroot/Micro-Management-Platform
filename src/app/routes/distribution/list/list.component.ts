import {Component, OnInit} from '@angular/core';
import {STColumn, STColumnTag} from "@delon/abc";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFSchema} from "@delon/form";

const TAG: STColumnTag = {
    0: {text: '隐藏', color: ''},
    1: {text: '显示', color: 'green'},
};

@Component({
    selector: 'micro-liat',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
    ) {
    }

    ngOnInit() {
        this.isLoadingDistributorList();
    }

    // 加载供应商列表
    isLoadingList: boolean = false;
    distributorList = [];
    distributorColumnSetting: STColumn[] = [
        {
            title: '分销商ID', index: 'shop_id', format: (item) => {
                return 'D' + item.shop_id;
            }
        },
        {title: '名称', index: 'name'},
        {title: '电话', index: 'mobile'},
        {title: '所有者', index: 'owner'},
        {title: '状态', index: 'status', type: 'tag', tag: TAG},
        {
            title: '操作', buttons: [
                {
                    text: (record) => {
                        return record.status == 1 ? '隐藏' : '显示';
                    }, type: 'none', click: ((record) => {
                      this.handleChangeDistributorStatus(parseInt(record['shop_id']), record['status'] == 0);
                    })
                },
                {
                    text: '修改',
                    type: 'none',
                    click: (record) => {
                        this.isAddModal = false;
                        this.handleAddOrEditDeliveryFormDataInit(record);
                        this.showAddOrDeliveryModal();
                    }
                },
                {
                    text: '销售明细',
                    type: 'none',
                    click: (record) => {
                        this.showShopSellModal = true;
                        this.loadSellList(record.shop_id);
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (record) => {
                        this.handleRemoveDelivery(parseInt(record['shop_id']));
                    }
                }
            ]
        }
    ];

    isLoadingDistributorList() {
        this.isLoadingList = true;
        this.distributorList = [];
        this._microAppHttpClient.get(Interface.LoadDistributorListEndPoint).subscribe((data) => {
            if (data) {
                this.distributorList = data;
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

    // 修改分销商状态
    handleChangeDistributorStatus(shop_id: number, status: boolean) {
        let changeDistributorStatusTemplate = {
            shop_id: shop_id,
            status: status? 1:0
        };
        this.isLoadingList = true;
        this._microAppHttpClient.post(Interface.DistributorStatusSetEndPoint, changeDistributorStatusTemplate).subscribe((data) => {
           this.msg.info(`${status ? '显示' : '隐藏'}分销商成功!`);
            this.isLoadingDistributorList();
        }, (err) => {
            this.msg.error(`${status ? '显示' : '隐藏'}分销商失败, 请重新操作!`);
        });
    }

    // 添加/修改 供应商 信息
    addOrEditDeliveryModalVisible: boolean = false;
    isAddModal = true;
    deliveryFormData: any;
    deliverySchema: SFSchema = {
        properties: {
            name: {
                type: 'string',
                title: '名称'
            },
            owner: {
                type: 'string',
                title: '所有者'
            },
            mobile: {
                type: 'string',
                title: '电话'
            },
            status: {
                type: 'boolean',
                title: '是否显示',
                ui: {
                    checkedChildren: '显示',
                    unCheckedChildren: '隐藏',
                }
            }

        },
        required: ['name', 'owner', 'mobile', 'status']
    };
    isAddingOrEditingDelivery: boolean = false;
    editDeliveryLabel: number = 0;

    showAddOrDeliveryModal(): void {
        if (this.isAddModal) {
            this.handleAddOrEditDeliveryFormDataInit();
        }
        this.addOrEditDeliveryModalVisible = true;
    }

    handleCreateOrEditDeliveryCancel(): void {
        this.isAddModal = true;
        this.handleAddOrEditDeliveryFormDataInit();
        this.addOrEditDeliveryModalVisible = false;
    }

    handleAddOrEditDeliveryFormDataInit(e: any = {}): void {
        if (this.isAddModal) {
            this.deliveryFormData = {
                name: '',
                owner: '',
                mobile: '',
                status: false
            }
        } else {
            this.editDeliveryLabel = e['shop_id'];
            this.deliveryFormData = {
                name: e['name'],
                owner: e['owner'],
                mobile: e['mobile'],
                status: parseInt(e['status']) != 0
            }
        }
    }

    disableCreateOrEditDeliverySubmitButton(sf: SFComponent): boolean {
        return !sf.valid;
    }

    handleCreateOrEditDeliverySubmit(value: any): void {
        let deliveryTemplate = {
            shop_id: this.isAddModal ? 0 : this.editDeliveryLabel,
            name: value['name'],
            owner: value['owner'],
            mobile: value['mobile'],
            status: value['status']
        };
        this.isAddingOrEditingDelivery = true;
        this._microAppHttpClient.post(Interface.AddDistributorEndPoint, deliveryTemplate).subscribe((data) => {
            this.isAddingOrEditingDelivery = false;
            this.msg.info(this.isAddModal ? '添加分销商信息成功!' : '修改分销商信息成功!');
            this.handleCreateOrEditDeliveryCancel();
            this.isLoadingDistributorList();
        }, (err) => {
            this.isAddingOrEditingDelivery = false;
            this.msg.error(this.isAddModal ? '添加分销商信息失败!' : '修改分销商信息失败!');
        });

    }

    handleRemoveDelivery(label: number) {
        this.isLoadingList = true;
        let removeDeliveryTemplate = {
            shop_id: label
        };
        this._microAppHttpClient.post(Interface.DeleteDistributorEndPoint, removeDeliveryTemplate).subscribe((data) => {
            this.msg.info('删除分销商信息成功!');
            this.isLoadingDistributorList();
        }, (err) => {
            this.msg.error('删除分销商信息失败, 请重新删除!');
        })
    }

    showShopSellModal: boolean = false;
    handleHideShopSellModal() {
        this.showShopSellModal = false;
    }
    isLoadingSellList: boolean = false;
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
                        return '已打款';
                    case 0:
                        return '未打款';
                }
            }},
    ];

    loadSellList(shop) {
         this.isLoadingSellList = true;
        this.sellList = [];
        this._microAppHttpClient.get(Interface.SellOrderEndPoint + '?id=' + shop).subscribe((data) => {
            if (data) {
                this.sellList = data;
            }
            this.isLoadingSellList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingSellList = false;
        })
    }
}
