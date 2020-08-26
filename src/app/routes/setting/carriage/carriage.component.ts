import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {STColumn, STColumnBadge, STData} from "@delon/abc";
import {SFSchema, SFSelectWidgetSchema, SFStringWidgetSchema} from "@delon/form";
import {of} from "rxjs";
import {delay} from "rxjs/operators";

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
    ;

    isLoadingList = false;
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

    carriageRuleListShopName = '';
    carriageRuleListSubTitle = '';
    carriageRuleListType: number;
    carriageRuleListShopRuleList: [];
    carriageRuleListShopRuleColumnSettings: STColumn[] = [
        {
            title: 'ID', format: item => {
                return 'R' + item.rule_id;
            }
        },
        {title: '规则名称', index: 'rule_name'},
        {
            title: '邮费类型', index: 'type', format: item => {
                switch (item.type) {
                    case 1:
                        return '江阴城区';
                    case 2:
                        return '江阴乡镇';
                    case 3:
                        return '外省市';
                    case 4:
                        return '特殊省市';
                }
            }
        },
        {title: '地区名称（省市）', index: 'region'},
        {title: '订单基准金额', index: 'base_order_price'},
        {title: '订单基准重量（克）', index: 'base_weight'},
        {title: '低于订单基准金额首重运费', index: 'lower_base_carriage'},
        {title: '低于订单基准金额续重运费/斤', index: 'lower_extra_carriage'},
        {title: '不低于订单基准金额首重运费', index: 'higher_base_carriage'},
        {title: '不低于订单基准金额续重运费/斤', index: 'higher_extra_carriage'},
        {title: '状态', index: 'status', type: 'badge', badge: BADGE},
        {
            title: '操作', buttons: [
                {
                    text: '编辑', type: 'none', click: record => {
                        this.handleShowEditCarriageModal(record);
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
        {
            title: '邮费类型', index: 'type', format: item => {
                switch (item.type) {
                    case 1:
                        return '江阴城区';
                    case 2:
                        return '江阴乡镇';
                    case 3:
                        return '外省市';
                    case 4:
                        return '特殊省市';
                }
            }
        },
        {title: '地区名称（省市）', index: 'region'},
        {title: '订单基准金额', index: 'base_order_price'},
        {title: '订单基准重量（克）', index: 'base_weight'},
        {title: '低于订单基准金额首重运费', index: 'lower_base_carriage'},
        {title: '低于订单基准金额续重运费/斤', index: 'lower_extra_carriage'},
        {title: '不低于订单基准金额首重运费', index: 'higher_base_carriage'},
        {title: '不低于订单基准金额续重运费/斤', index: 'higher_extra_carriage'},
        {title: '状态', index: 'status', type: 'badge', badge: BADGE},
        {
            title: '操作', buttons: [
                {
                    text: '编辑', type: 'none', click: record => {
                        this.handleShowEditCarriageModal(record);
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
    isCarriageDetailListVisible = false;

    addCarriageModalVisible = false;
    addCarriageSchema: SFSchema = {
        properties: {
            type: {type: 'string', title: '规则级别', enum: ['供应商运费规则', '特殊商品运费规则'], default: '供应商运费规则'},
            shop: {
                type: 'number', title: '供应商', ui: {
                    widget: 'select',
                    asyncData: () =>
                        of(this.shopList).pipe(delay(10)),
                } as SFSelectWidgetSchema
            },
            product: {
                type: 'number', title: '商品', ui: {
                    widget: 'select',
                    asyncData: () =>
                        of(this.prodctList).pipe(delay(10)),
                } as SFSelectWidgetSchema
            },
            rule_name: {type: 'string', title: '规则名称'},
            rule_type: {
                type: 'number', title: '规则类型', enum: [
                    {label: '江阴城区', value: 1},
                    {label: '江阴乡镇', value: 2},
                    {label: '外省市', value: 3},
                    {label: '特殊省市', value: 4}
                ], default: 1,
                ui: {
                    widget: 'select'
                } as SFSelectWidgetSchema
            },
            special_region: {
                type: 'string', title: '地区名称（省市）', enum: [
                    {label: '北京市', value: '北京市'},
                    {label: '天津市', value: '天津市'},
                    {label: '河北省', value: '河北省'},
                    {label: '山西省', value: '山西省'},
                    {label: '内蒙古自治区', value: '内蒙古自治区'},
                    {label: '辽宁省', value: '辽宁省'},
                    {label: '吉林省', value: '吉林省'},
                    {label: '黑龙江省', value: '黑龙江省'},
                    {label: '上海市', value: '上海市'},
                    {label: '江苏省', value: '江苏省'},
                    {label: '浙江省', value: '浙江省'},
                    {label: '安徽省', value: '安徽省'},
                    {label: '福建省', value: '福建省'},
                    {label: '江西省', value: '江西省'},
                    {label: '山东省', value: '山东省'},
                    {label: '河南省', value: '河南省'},
                    {label: '湖北省', value: '湖北省'},
                    {label: '湖南省', value: '湖南省'},
                    {label: '广东省', value: '广东省'},
                    {label: '广西壮族自治区', value: '广西壮族自治区'},
                    {label: '海南省', value: '海南省'},
                    {label: '重庆市', value: '重庆市'},
                    {label: '四川省', value: '四川省'},
                    {label: '贵州省', value: '贵州省'},
                    {label: '云南省', value: '云南省'},
                    {label: '西藏自治区', value: '西藏自治区'},
                    {label: '陕西省', value: '陕西省'},
                    {label: '甘肃省', value: '甘肃省'},
                    {label: '青海省', value: '青海省'},
                    {label: '宁夏回族自治区', value: '宁夏回族自治区'},
                    {label: '新疆维吾尔自治区', value: '新疆维吾尔自治区'},
                    {label: '台湾省', value: '台湾省'},
                    {label: '香港特别行政区', value: '香港特别行政区'},
                    {label: '澳门特别行政区', value: '澳门特别行政区'}
                ], ui: {
                    widget: 'select'
                } as SFSelectWidgetSchema
            },
            base_order_price: {type: 'number', title: '订单基准金额'},
            base_weight: {
                type: 'number', title: '订单基准重量', ui: {
                    unit: '克'
                } as SFStringWidgetSchema
            },
            lower_base_carriage: {type: 'number', title: '低于订单基准金额首重运费'},
            lower_extra_carriage: {
                type: 'number', title: '低于订单基准金额续重运费', ui: {
                    unit: '斤'
                } as SFStringWidgetSchema
            },
            higher_base_carriage: {type: 'number', title: '不低于订单基准金额首重运费'},
            higher_extra_carriage: {
                type: 'number', title: '不低于订单基准金额续重运费', ui: {
                    unit: '斤'
                } as SFStringWidgetSchema
            },
            status: {
                type: 'boolean',
                title: '是否生效',
                ui: {
                    checkedChildren: '是',
                    unCheckedChildren: '否',
                }
            }
        },
        required: ['type', 'rule_name', 'base_order_price', 'base_weight', 'lower_base_carriage', 'lower_extra_carriage', 'higher_base_carriage', 'higher_extra_carriage'],
        if: {
            properties: {type: {enum: ['供应商运费规则']}}
        },
        then: {
            required: ['shop']
        },
        else: {
            required: ['product']
        }
    };
    shopList: STData[] = [];
    prodctList: STData[] = [];
    isAddingCarriageRule = false;

    ngOnInit() {
        this.loadCarriageList();
    }

    loadCarriageList() {
        this.isLoadingList = true;
        this._microAppHttpClient.get(Interface.LoadCarriageListEndPoint).subscribe((data) => {
            if (data) {
                this.carriageList = data;
            }
            this.isLoadingList = false;
            this.loadShopList();
        }, (err) => {
            this.msg.error('加载运费规则列表失败!');
        })
    }

    handleShowShopOrProductRuleList() {
        this.isCarriageDetailListVisible = true;
    }

    handleHideShopOrProductRuleList() {
        this.isCarriageDetailListVisible = false;
    }

    loadShopList() {
        this.shopList = [];
        this._microAppHttpClient.get(Interface.LoadCarriageShopListEndPoint).subscribe(data => {
            if (data) {
                data.forEach(element => {
                    this.shopList.push(
                        {label: element.name, value: element.shop_id}
                    )
                });
            }
            this.loadProductList();
        }, err => {
            this.handleAddCarriageHideEvent();
            this.msg.error('初始化添加模板失败!');
        })
    }

    loadProductList() {
        this.prodctList = [];
        this._microAppHttpClient.get(Interface.LoadCarriageProductListEndPoint).subscribe(data => {
            if (data) {
                data.forEach(element => {
                    this.prodctList.push(
                        {label: element.name, value: element.id}
                    )
                });
            }
        }, err => {
            this.handleAddCarriageHideEvent();
            this.msg.error('初始化添加模板失败!');
        })
    }

    handleAddCarriageShowEvent() {
        this.addCarriageModalVisible = true;
    }

    handleAddCarriageHideEvent() {
        this.addCarriageModalVisible = false;
    }

    handleAddCarriageSubmit(value: any) {
        this.isAddingCarriageRule = true;
        const addCarriageRuleTemplate = {
            "carriage_rule_id": 0,
            "is_shop": value.type == '供应商运费规则'? 'true':'false',
            "rule_name": value.rule_name,
            "shop_id": value.shop,
            "product_id": value.product,
            "rule_type": value.rule_type,
            "special_region": value.special_region,
            "base_order_price": value.base_order_price,
            "base_weight": value.base_weight,
            "lower_base_carriage": value.lower_base_carriage,
            "lower_extra_carriage": value.lower_extra_carriage,
            "higher_base_carriage": value.higher_base_carriage,
            "higher_extra_carriage": value.higher_extra_carriage,
            "status": value.status ? 1 : 0,
        };
        this._microAppHttpClient.post(Interface.AddOrEditCarriageEndPoint, addCarriageRuleTemplate).subscribe(data => {
            this.isAddingCarriageRule = false;
            this.loadCarriageList();
        }, err => {
            this.isAddingCarriageRule = false;
            this.msg.error('添加运费规则失败, 请重试!');
        });
    }

    handleDeleteCarriageRule(r_id: number) {
        const carriageRuleTemplate = {
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

    editCarriageModalVisible = false;
    editCarriageModalFormData: any;
    editCarriageSchema: SFSchema = {
        properties: {
            rule_name: {type: 'string', title: '规则名称'},
            rule_type: {
                type: 'number', title: '规则类型', enum: [
                    {label: '江阴城区', value: 1},
                    {label: '江阴乡镇', value: 2},
                    {label: '外省市', value: 3},
                    {label: '特殊省市', value: 4}
                ], default: 1,
                ui: {
                    widget: 'select'
                } as SFSelectWidgetSchema
            },
            special_region: {
                type: 'string', title: '地区名称（省市）', enum: [
                    {label: '北京市', value: '北京市'},
                    {label: '天津市', value: '天津市'},
                    {label: '河北省', value: '河北省'},
                    {label: '山西省', value: '山西省'},
                    {label: '内蒙古自治区', value: '内蒙古自治区'},
                    {label: '辽宁省', value: '辽宁省'},
                    {label: '吉林省', value: '吉林省'},
                    {label: '黑龙江省', value: '黑龙江省'},
                    {label: '上海市', value: '上海市'},
                    {label: '江苏省', value: '江苏省'},
                    {label: '浙江省', value: '浙江省'},
                    {label: '安徽省', value: '安徽省'},
                    {label: '福建省', value: '福建省'},
                    {label: '江西省', value: '江西省'},
                    {label: '山东省', value: '山东省'},
                    {label: '河南省', value: '河南省'},
                    {label: '湖北省', value: '湖北省'},
                    {label: '湖南省', value: '湖南省'},
                    {label: '广东省', value: '广东省'},
                    {label: '广西壮族自治区', value: '广西壮族自治区'},
                    {label: '海南省', value: '海南省'},
                    {label: '重庆市', value: '重庆市'},
                    {label: '四川省', value: '四川省'},
                    {label: '贵州省', value: '贵州省'},
                    {label: '云南省', value: '云南省'},
                    {label: '西藏自治区', value: '西藏自治区'},
                    {label: '陕西省', value: '陕西省'},
                    {label: '甘肃省', value: '甘肃省'},
                    {label: '青海省', value: '青海省'},
                    {label: '宁夏回族自治区', value: '宁夏回族自治区'},
                    {label: '新疆维吾尔自治区', value: '新疆维吾尔自治区'},
                    {label: '台湾省', value: '台湾省'},
                    {label: '香港特别行政区', value: '香港特别行政区'},
                    {label: '澳门特别行政区', value: '澳门特别行政区'}
                ], ui: {
                    widget: 'select'
                } as SFSelectWidgetSchema
            },
            base_order_price: {type: 'number', title: '订单基准金额'},
            base_weight: {
                type: 'number', title: '订单基准重量', ui: {
                    unit: '克'
                } as SFStringWidgetSchema
            },
            lower_base_carriage: {type: 'number', title: '低于订单基准金额首重运费'},
            lower_extra_carriage: {
                type: 'number', title: '低于订单基准金额续重运费', ui: {
                    unit: '斤'
                } as SFStringWidgetSchema
            },
            higher_base_carriage: {type: 'number', title: '不低于订单基准金额首重运费'},
            higher_extra_carriage: {
                type: 'number', title: '不低于订单基准金额续重运费', ui: {
                    unit: '斤'
                } as SFStringWidgetSchema
            },
            status: {
                type: 'boolean',
                title: '是否生效',
                ui: {
                    checkedChildren: '是',
                    unCheckedChildren: '否',
                }
            }
        },
        required: ['rule_name', 'base_order_price', 'base_weight', 'lower_base_carriage', 'lower_extra_carriage', 'higher_base_carriage', 'higher_extra_carriage'],
        if: {
            properties: {rule_type: {enum: [4]}}
        },
        then: {
            required: ['special_region']
        },
        else: {
            required: []
        }
    };
    isEditingCarriageRule: boolean = false;

    handleShowEditCarriageModal(data) {
        this.editCarriageModalVisible = true;
        this.editCarriageModalFormData = data;
    }

    handleHideEditCarriageModal() {
        this.editCarriageModalVisible = false;
    }

    handleEditSaveCarriageRule(value: any) {
        this.isEditingCarriageRule = true;
        const editCarriageRuleTemplate = {
            "carriage_rule_id": this.editCarriageModalFormData.rule_id,
            "is_shop": Object.keys(this.editCarriageModalFormData).includes('shop_id')? 'true':'false',
            "rule_name": value.rule_name,
            "shop_id": this.editCarriageModalFormData.shop_id,
            "product_id": this.editCarriageModalFormData.product_id,
            "rule_type": value.rule_type,
            "special_region": value.special_region,
            "base_order_price": value.base_order_price,
            "base_weight": value.base_weight,
            "lower_base_carriage": value.lower_base_carriage,
            "lower_extra_carriage": value.lower_extra_carriage,
            "higher_base_carriage": value.higher_base_carriage,
            "higher_extra_carriage": value.higher_extra_carriage,
            "status": value.status ? 1 : 0,
        };
        this._microAppHttpClient.post(Interface.AddOrEditCarriageEndPoint, editCarriageRuleTemplate).subscribe(data => {
            this.isEditingCarriageRule = false;
            this.handleHideEditCarriageModal();
            this.handleHideShopOrProductRuleList();
            this.loadCarriageList();
        }, err => {
            this.isEditingCarriageRule = false;
            this.msg.error('添加运费规则失败, 请重试!');
        });
    }

}
