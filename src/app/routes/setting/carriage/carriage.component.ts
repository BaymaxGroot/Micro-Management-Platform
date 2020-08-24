import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {STColumn, STColumnBadge} from "@delon/abc";
import {SFSchema} from "@delon/form";

const BADGE: STColumnBadge = {
    0: {text: '失效', color: 'default'},
    1: {text: '生效', color: 'success'},
};

@Component({
    selector: 'micro-carriage',
    templateUrl: './carriage.component.html',
    styleUrls: ['./carriage.component.less']
})
export class CarriageComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService
    ) {
    }

    ngOnInit() {
        this.loadCarriageList();
    }

    isLoadingList: boolean = false;
    carriageList = [];
    carriageColumnSettings: STColumn[] = [
        {
            title: '分销商ID', index: '', format: (item, col) => {
                return 'D' + item.shop_id;
            }
        },
        {title: '分销商名称', index: 'shop_name'},
        {
            title: '分销商级别运费规则', buttons: [
                {
                    text: record => {
                        return record.shop_rule_list.length;
                    }, type: 'none', click: record => {
                        if (record.shop_rule_list.length == 0) return;
                        this.carriageRuleListShopRuleList = record.shop_rule_list;
                        this.carriageRuleListShopName = record.shop_name;
                        this.carriageRuleListType = 1;
                        this.carriageRuleListSubTitle = '供应商';
                        this.handleShowShopOrProductRuleList();
                    }
                }
            ]
        },
        {
            title: '特殊商品级别运费规则', buttons: [
                {
                    text: record => {
                        return record.product_rule_list.length;
                    }, type: 'none', click: record => {
                        if (record.product_rule_list.length == 0) return;
                        this.carriageRuleListProductRuleList = record.product_rule_list;
                        this.carriageRuleListShopName = record.shop_name;
                        this.carriageRuleListSubTitle = '特殊商品';
                        this.carriageRuleListType = 2;
                        this.handleShowShopOrProductRuleList();
                    }
                }
            ]
        }
    ];

    loadCarriageList() {
        this.isLoadingList = true;
        this._microAppHttpClient.get(Interface.LoadCarriageListEndPoint).subscribe((data) => {
            if (data) {
                this.carriageList = data;
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('加载运费规则列表失败!');
        })
    }

    carriageRuleListShopName: string = '';
    carriageRuleListSubTitle: string = '';
    carriageRuleListType: number;
    carriageRuleListShopRuleList: [];
    carriageRuleListShopRuleColumnSettings: STColumn[] = [
        {
            title: 'ID', format: item => {
                return 'R' + item.rule_id;
            }
        },
        {title: '规则名称', index: 'rule_name'},
        {title: '邮费类型', index: 'type'},
        {title: 'region', index: 'region'},
        {title: 'base_order_price', index: 'base_order_price'},
        {title: 'base_weight', index: 'base_weight'},
        {title: 'lower_base_carriage', index: 'lower_base_carriage'},
        {title: 'lower_extra_carriage', index: 'lower_extra_carriage'},
        {title: 'higher_base_carriage', index: 'higher_base_carriage'},
        {title: 'higher_extra_carriage', index: 'higher_extra_carriage'},
        {title: '状态', index: 'status', type: 'badge', badge: BADGE},
        {
            title: '操作', buttons: [
                {
                    text: '编辑', type: 'none', click: record => {

                    }
                },
                {
                    text: '删除', type: 'del', click: record => {
                        this.handleDeleteCarriageRule(record.rule_id);
                    }
                }
            ]
        }
    ];
    carriageRuleListProductRuleList: [];
    carriageRuleListProductRuleColumnSettings: STColumn[] = [
        {
            title: 'ID', format: item => {
                return 'R' + item.rule_id;
            }
        },
        {title: '规则名称', index: 'rule_name'},
        {title: '邮费类型', index: 'type'},
        {title: 'region', index: 'region'},
        {title: 'base_order_price', index: 'base_order_price'},
        {title: 'base_weight', index: 'base_weight'},
        {title: 'lower_base_carriage', index: 'lower_base_carriage'},
        {title: 'lower_extra_carriage', index: 'lower_extra_carriage'},
        {title: 'higher_base_carriage', index: 'higher_base_carriage'},
        {title: 'higher_extra_carriage', index: 'higher_extra_carriage'},
        {title: '商品', index: 'product_name'},
        {title: '状态', index: 'status', type: 'badge', badge: BADGE},
        {
            title: '操作', buttons: [
                {
                    text: '编辑', type: 'none', click: record => {

                    }
                },
                {
                    text: '删除', type: 'del', click: record => {
                        this.handleDeleteCarriageRule(record.rule_id);
                    }
                }
            ]
        }
    ];
    isCarriageDetailListVisible: boolean = false;

    handleShowShopOrProductRuleList() {
        this.isCarriageDetailListVisible = true;
    }

    handleHideShopOrProductRuleList() {
        this.isCarriageDetailListVisible = false;
    }


    // type=1: 添加供应商级别的运费规则 ;type=2: 添加特殊商品级别的运费规则
    handleAddCarriageEvent(type: number) {
        this.addCarriageModalType = type;
        switch (this.addCarriageModalType) {
            case 1:
                this.addCarriageModalSubTitle = '供应商';
                break;
            case 2:
                this.addCarriageModalSubTitle = '特殊商品';
                break;
        }
        this.handleAddCarriageShowEvent();
    }

    addCarriageModalVisible: boolean = false;
    addCarriageModalType: number;
    addCarriageModalSubTitle: string;
    addCarriageSchema: SFSchema = {
        properties: {
            shop: {},
            product: {},
            rule_name: { type: 'string', title: '规则名称'},
            rule_type: {},
            special_region: {},
            base_order_price: {},
            base_weight: {},
            lower_base_carriage: {},
            lower_extra_carriage: {},
            higher_base_carriage: {},
            higher_extra_carriage: {},
            status: {
                type: 'boolean',
                title: '是否生效',
                ui: {
                    checkedChildren: '是',
                    unCheckedChildren: '否',
                }
            }
        }
    };

    handleAddCarriageShowEvent() {
        this.addCarriageModalVisible = true;
    }

    handleAddCarriageHideEvent() {
        this.addCarriageModalVisible = false;
    }


    handleDeleteCarriageRule(r_id: number) {
        let carriageRuleTemplate = {
            carriage_rule_id: r_id
        };
        this._microAppHttpClient.post(Interface.DeleteCarriageEndPoint, carriageRuleTemplate).subscribe(data => {
            this.msg.info('删除运费规则成功!');
            this.handleHideShopOrProductRuleList();
            this.loadCarriageList();
        }, err => {
            this.msg.error('删除运费规则失败!');
        });
    }


}
