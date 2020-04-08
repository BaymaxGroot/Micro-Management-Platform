import {Component, Inject, Injectable, OnInit} from '@angular/core';
import {STChange, STColumn, STColumnTag, STData} from "@delon/abc";
import {FormBuilder} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {UploadIconService} from "@shared/service/upload-icon.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {
    FormProperty, PropertyGroup,
    SFComponent,
    SFRadioWidgetSchema,
    SFSchema,
    SFSelectWidgetSchema,
    SFTreeSelectWidgetSchema,
    SFUploadWidgetSchema
} from "@delon/form";
import {of} from "rxjs";
import {delay} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

const TAG: STColumnTag = {
    0: {text: '已下架', color: ''},
    1: {text: '已上架', color: 'green'},
};

@Component({
    selector: 'micro-management',
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.less']
})
export class ManagementComponent implements OnInit {
    private _uploadIconsService: UploadIconService;
    private _uploadDetailIconService: UploadIconService;

    constructor(
        private fb: FormBuilder,
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private _uploadMainImageService: UploadIconService,
        private _httpClient: HttpClient
    ) {
        this._uploadMainImageService.maxUploadLimit = 1;
        this._uploadIconsService = new UploadIconService(_httpClient, msg);
        this._uploadIconsService.maxUploadLimit = 6;

        this._uploadDetailIconService = new UploadIconService(_httpClient, msg);
        this._uploadDetailIconService.maxUploadLimit = 10;
    }

    ngOnInit() {
        this.loadProductList();
        this.loadCategoryList();
        this.loadShopList();
    }

    /**
     * 商品列表设置
     */
    isLoadingList = true;
    typeFilterList = [];
    columnsSetting: STColumn[] = [
        {title: '编号', index: 'check', type: 'checkbox'},
        {
            title: 'ID', index: 'id', format: (item) => {
                return 'P' + item['id'];
            }
        },
        {
            title: '商品类型', index: 'cname', filter: {
                menus: [],
                fn: (filter, record) => {
                    return record.cname == filter.value;
                }
            }
        },
        {
            title: '商品名称', index: 'name', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.name.indexOf(filter.value) !== -1
                },
            },
        },
        {title: '商品图片', index: 'main_image_url', type: 'img'},
        {
            title: {text: '售价 / 原价', optional: '（单位：￥）'}, index: 'price', format: (item) => {
                return item.price + ' / ' + item.original_price;
            }
        },
        {title: '库存', index: 'stock'},
        {
            title: '状态', index: 'status', type: 'tag', tag: TAG, filter: {
                menus: [
                    {text: '已上架', value: 1},
                    {text: '已下架', value: 0}
                ],
                fn: (filter, record) => {
                    return record.status == filter.value;
                }
            }
        },
        {title: '虚拟销量', index: 'fake_sales'},
        {title: '实际销量', index: 'actual_sales'},
        {title: '排序', index: 'sort'},
        {
            title: '操作', buttons: [
                {
                    text: (record, btn) => {
                        return record.status == 1 ? '下架' : '上架';
                    }, type: 'none', click: (record, modal, instance) => {
                        this.handleDownOrUpProduct([parseInt(record.id)], record.status == 0);
                    }
                },
                {
                    text: '修改', type: 'none', click: (record, modal, instance) => {
                        this.isAddModal = false;
                        this.handleAddOrEditProductFormDataInit(record);
                        this.handleCreateOrEditProductModelShow();
                    }
                },
                {
                    text: '删除', type: 'del', click: (record, modal, instance) => {
                        this.handleRemoveProduct([parseInt(record.id)]);
                    }
                },
            ]
        }
    ];
    productListData: STData[] = [];
    checkboxSelectedList: STData[] = [];

    /**
     * 加载商品列表
     */
    loadProductList() {
        // 数据初始化
        this.isLoadingList = true;
        this.productListData = [];
        this.typeFilterList = [];
        this.checkboxSelectedList = [];
        this.productRootList = [];

        this._microAppHttpClient.get(Interface.LoadProductListEndPoint).subscribe((data) => {
            if (data) {
                this.productListData = data;
                this.productListData.forEach((item) => {
                    this.productRootList.push({
                        title: item['name'],
                        key: item['id']
                    });
                    item['check'] = 0;
                    if (item['main_image']) {
                        item['main_image_url'] = environment.SERVER_URL + '/static/upload/' + item['main_image'];
                    }
                    if (item['cname']) {
                        let flag = true;
                        this.typeFilterList.forEach((ca) => {
                            if (ca.text == item['cname']) {
                                flag = false;
                                return;
                            }
                        });
                        if (flag) {
                            this.typeFilterList.push({
                                text: item['cname'], value: item['cname']
                            });
                        }
                    }
                });
            }
            this.columnsSetting.forEach((item) => {
                if (item.title == '商品类型') {
                    item.filter.menus = this.typeFilterList;
                }
            });
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

    /**
     * 加载商品分类信息
     */
    isLoadingCategoryList = false;

    loadCategoryList() {
        this.isLoadingCategoryList = true;
        this.categoryRootList = [];
        this._microAppHttpClient.get(Interface.LoadProductCategoryListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    this.categoryRootList.push({
                        label: item['cname'],
                        value: parseInt(item['clabel'])
                    });
                });
            }
            this.isLoadingCategoryList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingCategoryList = false;
        })
    }

    /**
     * 加载商户信息
     */
    isLoadingShopList = false;

    loadShopList() {
        this.isLoadingShopList = true;
        this.shopList = [];
        this._microAppHttpClient.get(Interface.LoadDistributorListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    this.shopList.push({
                        label: item['name'],
                        value: parseInt(item['shop_id'])
                    });
                });
            }
            this.isLoadingShopList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingShopList = false;
        })
    }

    /**
     * 添加 / 修改 商品信息模块
     */
    addOrEditProductModalVisible: boolean = false;
    isAddModal = true;
    productFormData: any;
    categoryRootList = [];
    shopList = [];
    productRootList = [];
    productSchema: SFSchema = {
        properties: {
            category: {
                type: 'string',
                title: '商品分类',
                ui: {
                    widget: 'select',
                    asyncData: () =>
                        of(this.categoryRootList).pipe(delay(10)),
                    grid: {
                        span: 24
                    }
                } as SFSelectWidgetSchema
            },
            shop: {
                type: 'string',
                title: '供应商',
                ui: {
                    widget: 'select',
                    asyncData: () =>
                        of(this.shopList).pipe(delay(10)),
                    grid: {
                        span: 24
                    }
                } as SFSelectWidgetSchema
            },
            name: {
                type: 'string',
                title: '商品名称'
            },
            sub_title: {
                type: 'string',
                title: '副标题'
            },
            unit: {
                type: 'string',
                title: '单位',
                ui: {
                    grid: {
                        span: 6
                    }
                }
            },
            weight: {
                type: 'number',
                title: '重量',
                minimum: 0,
                ui: {
                    unit: '克',
                    grid: {
                        span: 6
                    }
                }
            },
            rank: {
                type: 'integer',
                title: '商品排序',
                minimum: 1,
                ui: {
                    optionalHelp: '排序按升序排列',
                    grid: {
                        span: 6
                    }
                }
            },
            stock: {
                type: 'integer',
                title: '库存',
                minimum: 0,
                ui: {
                    grid: {
                        span: 6
                    }
                }
            },
            v_sales: {
                type: 'integer',
                title: '虚拟销量',
                minimum: 1,
                ui: {
                    optionalHelp: '前端展示的销量=实际销量+虚拟销量'
                }
            },
            v_visit: {
                type: 'integer',
                title: '虚拟浏览量',
                minimum: 1,
                ui: {
                    optionalHelp: '前端展示的浏览量=实际浏览量+虚拟浏览量'
                }
            },
            main_icon: {
                type: 'string',
                title: '商品缩略图',
                enum: [],
                ui: {
                    widget: 'upload',
                    validator: (value: any, formProperty: FormProperty, form: PropertyGroup) => {
                      return [];
                    },
                    action: `${environment.SERVER_URL}/api${Interface.UploadImage}`,
                    listType: 'picture-card',
                    showUploadList: true,
                    beforeUpload: (file, fileList) => {
                        return this._uploadMainImageService.handleBeforeUpload(file, fileList);
                    },
                    change: (args) => {
                        return this._uploadMainImageService.handleUploadSuccess(args);
                    },
                    customRequest: (item) => {
                        return this._uploadMainImageService.uploadImage(item);
                    },
                    remove: (file) => {
                        return this._uploadMainImageService.handleDeleteIcon(file);
                    },
                } as SFUploadWidgetSchema
            },
            icons: {
                type: 'string',
                title: '商品图片',
                enum: [],
                ui: {
                    widget: 'upload',
                    validator: (value: any, formProperty: FormProperty, form: PropertyGroup) => {
                      return [];
                    },
                    action: `${environment.SERVER_URL}/api${Interface.UploadImage}`,
                    listType: 'picture-card',
                    optionalHelp: '最少上传三张',
                    showUploadList: true,
                    beforeUpload: (file, fileList) => {
                        return this._uploadIconsService.handleBeforeUpload(file, fileList);
                    },
                    change: (args) => {
                        return this._uploadIconsService.handleUploadSuccess(args);
                    },
                    customRequest: (item) => {
                        return this._uploadIconsService.uploadImage(item);
                    },
                    remove: (file) => {
                        return this._uploadIconsService.handleDeleteIcon(file);
                    }
                } as SFUploadWidgetSchema
            },
            price: {
                type: 'number',
                title: '售价(元)',
                minimum: 1,
                ui: {
                    unit: '元',
                    grid: {
                        span: 6
                    }
                }
            },
            ori_price: {
                type: 'number',
                title: '原价(元)',
                minimum: 1,
                ui: {
                    unit: '元',
                    grid: {
                        span: 6
                    }
                }
            },
            purchase: {
                type: 'integer',
                title: '起购',
                minimum: 1,
                ui: {
                    optionalHelp: '限制每人购买最低购买数量, 默认为1',
                    grid: {
                        span: 6
                    }
                }
            },
            purchase_limit: {
                type: 'integer',
                title: '限购',
                minimum: 1,
                ui: {
                    optionalHelp: '限制每人购买次数, 设置 0 为不限购',
                    grid: {
                        span: 6
                    }
                }
            },
            activity_tag: {
                type: 'string',
                title: '活动标签',
                description: '注：建议中文字数不超过5个',
                ui: {
                    grid: {
                        span: 24
                    }
                }
            },
            use_specify: {
                type: 'array',
                title: '规格',
                maxItems: 3,
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            title: '规格名称'
                        },
                        price: {
                            type: 'number',
                            title: '售价',
                            minimum: 0
                        },
                        original_price: {
                            type: 'number',
                            title: '原价',
                            minimum: 0
                        },
                        stock: {
                            type: 'integer',
                            title: '库存',
                            minimum: 0
                        },
                        weight: {
                            type: 'number',
                            title: '重量',
                            minimum: 0,
                            ui: {
                                unit: '克'
                            }
                        },
                        max_buy_num: {
                            type: 'number',
                            title: '限购',
                            minimum: 0
                        }
                    }
                }
            },
            address: {
                type: 'string',
                title: '发货地址',
                ui: {
                    grid: {
                        span: 24
                    }
                }
            },
            delivery_type: {
                type: 'string',
                title: '发货方式',
                enum: [
                    {label: '快递或自提', value: 2},
                    {label: '仅快递', value: 0},
                    {label: '仅自提', value: 1}
                ],
                ui: {
                    widget: 'radio',
                    grid: {
                        span: 24
                    }
                } as SFRadioWidgetSchema,
                default: 0
            },
            // product_rec: {
            //     type: 'string',
            //     title: '商品推荐',
            //     ui: {
            //         widget: 'tree-select',
            //         multiple: true,
            //         asyncData: () =>
            //             of(this.productRootList).pipe(delay(10)),
            //         grid: {
            //             span: 24
            //         }
            //     } as SFTreeSelectWidgetSchema
            // },
            add_home_rec: {
                type: 'string',
                title: '首页推荐',
                enum: [
                    {label: '是', value: 1},
                    {label: '否', value: 0}
                ],
                ui: {
                    widget: 'radio',
                    grid: {
                        span: 24
                    }
                } as SFRadioWidgetSchema,
                default: 0
            },
            summary: {
                type: 'string',
                title: '商品详情',
                enum: [],
                ui: {
                    widget: 'upload',
                    validator: (value: any, formProperty: FormProperty, form: PropertyGroup) => {
                      return [];
                    },
                    action: `${environment.SERVER_URL}/api${Interface.UploadImage}`,
                    listType: 'picture-card',
                    showUploadList: true,
                    beforeUpload: (file, fileList) => {
                        return this._uploadDetailIconService.handleBeforeUpload(file, fileList);
                    },
                    change: (args) => {
                        return this._uploadDetailIconService.handleUploadSuccess(args);
                    },
                    customRequest: (item) => {
                        return this._uploadDetailIconService.uploadImage(item);
                    },
                    remove: (file) => {
                        return this._uploadDetailIconService.handleDeleteIcon(file);
                    },
                    grid: {
                        span: 24
                    }
                } as SFUploadWidgetSchema
            }
        },
        ui: {
            spanLabelFixed: 100,
            grid: {
                span: 12
            }
        },
        required: ['category', 'shop', 'name', 'price', 'ori_price', 'stock']
    };
    isAddingOrEditingProduct: boolean = false;
    editProductLabel: number = 0;

    /**
     * 打开添加商品 对话框
     */
    handleCreateOrEditProductModelShow() {
        if (this.isAddModal) {
            this.handleAddOrEditProductFormDataInit();
        }
        this.addOrEditProductModalVisible = true;
    }

    /**
     * 隐藏添加商品 对话框
     */
    handleCreateOrEditProductModelHide() {
        this.isAddModal = true;
        this.handleAddOrEditProductFormDataInit();
        this.addOrEditProductModalVisible = false;
    }

    /**
     * 添加商品 / 修改商品 表单数据初始化
     */
    handleAddOrEditProductFormDataInit(e: any = {}) {
        if (this.isAddModal) {
            this.productFormData = {
                category: '',
                shop: '',
                name: '',
                sub_title: '',
                unit: '',
                weight: 0,
                rank: 0,
                stock: 0,
                v_sales: 0,
                v_visit: 0,
                price: 0,
                ori_price: 0,
                purchase: 0,
                purchase_limit: 0,
                activity_tag: '',
                use_specify: [],
                address: '',
                delivery_type: 0,
                product_rec: '',
                add_home_rec: 0
            };
            this._uploadDetailIconService.emptyIconList();
            this._uploadIconsService.emptyIconList();
            this._uploadMainImageService.emptyIconList();
        } else {
            this.editProductLabel = parseInt(e['id']);
            this.productFormData = {
                category: parseInt(e['cat_id']),
                shop: parseInt(e['shop_id']),
                name: e['name'],
                sub_title: e['sub_title'],
                unit: e['unit'],
                weight: e['weight'],
                rank: e['sort'],
                stock: e['stock'],
                v_sales: e['fake_sales'],
                v_visit: e['fake_views'],
                price: e['price'],
                ori_price: e['original_price'],
                purchase: e['min_buy_num'],
                purchase_limit: e['max_buy_num'],
                activity_tag: e['tags'],
                use_specify: [],
                address: e['address'],
                delivery_type: parseInt(e['delivery']),
                product_rec: e['related_product'].split(','),
                add_home_rec: parseInt(e['is_recommend'])
            };
            if (e['main_image']) {
                this._uploadMainImageService.addIcon(e['main_image']);
            }
            if (e['images']) {
                e['images'].split(',').forEach((item) => {
                    this._uploadIconsService.addIcon(item);
                })
            }
            if (e['summary']) {
                e['summary'].split(',').forEach((item) => {
                    this._uploadDetailIconService.addIcon(item);
                })
            }
        }

        if (e['main_image']) {
            let icons = [];
            icons.push({
                uid: Math.ceil(Math.random() * 10000000),
                name: 'xxx.png',
                status: 'done',
                url: environment.SERVER_URL + '/static/upload/' + e['main_image'],
                response: {
                    resource_id: 1,
                },
            });
            this.productSchema.properties.main_icon.enum = icons;
        } else {
            this.productSchema.properties.main_icon.enum = [];
        }
        if (e['images']) {
            let icons = [];
            e['images'].split(',').forEach((item) => {
                icons.push({
                    uid: Math.ceil(Math.random() * 10000000),
                    name: 'xxx.png',
                    status: 'done',
                    url: environment.SERVER_URL + '/static/upload/' + item,
                    response: {
                        resource_id: 1,
                    },
                });
            });
            this.productSchema.properties.icons.enum = icons;
        } else {
            this.productSchema.properties.icons.enum = [];
        }
        if (e['summary']) {
            let icons = [];
            e['summary'].split(',').forEach((item) => {
                icons.push({
                    uid: Math.ceil(Math.random() * 10000000),
                    name: 'xxx.png',
                    status: 'done',
                    url: environment.SERVER_URL + '/static/upload/' + item,
                    response: {
                        resource_id: 1,
                    },
                });
            });
            this.productSchema.properties.summary.enum = icons;
        } else {
            this.productSchema.properties.summary.enum = [];
        }
    }

    /**
     * Submit 按钮是否可用
     */
    disableCreateOrEditProductSubmitButton(sf: SFComponent) {
        return this._uploadMainImageService.isUploding || this._uploadDetailIconService.isUploding;
    }

    /**
     * 添加 / 修改商品
     */
    handleCreateOrEditProductSubmit(value: any) {

        let tag = true;
        this.productSchema.required.forEach( (item) => {
            if (value[item] == '') {
                tag = false;
            }
        } );

        if(!tag) {
            this.msg.error('请填写必填字段!');
            return;
        }

        let createOrEditProductTemplate = {
            'id': this.isAddModal ? 0 : this.editProductLabel,
            'cat_id': parseInt(value.category),
            'shop_id': parseInt(value.shop),
            'sort': parseInt(value.rank ? value.rank : 1),
            'fake_sales': value.v_sales ? value.v_sales : 0,
            'fake_views': value.v_visit ? value.v_visit : 0,
            'tags': 0,
            'service': 0,
            'delivery': value.delivery_type ? value.delivery_type : 0,
            'stock': value.stock ? value.stock : 0,
            'min_buy_num': value.purchase ? value.purchase : 0,
            'max_buy_num': value.purchase_limit ? value.purchase_limit : 0,
            'show_specification': value.use_specify.length > 0 ? 1 : 0,
            'specifications': value.use_specify,
            'is_recommend': value.add_home_rec ? value.add_home_rec : 0,
            'weight': value.weight ? value.weight : 0,
            'price': value.price ? value.price : 0,
            'original_price': value.ori_price ? value.ori_price : 0,
            'name': value.name,
            'sub_title': value.sub_title ? value.sub_title : '',
            'address': value.address ? value.address : '',
            'unit': value.unit ? value.unit : '',
            'main_image': this._uploadMainImageService.iconList[0] ? this._uploadMainImageService.iconList[0] : '',
            'related_product': value.product_rec ? value.product_rec.join(',') : '',
            'images': this._uploadIconsService.iconList.join(','),
            'summary': this._uploadDetailIconService.iconList.join(',')
        };
        this.isAddingOrEditingProduct = true;
        this._microAppHttpClient.post(Interface.AddOrEditProductInfoEndPoint, createOrEditProductTemplate).subscribe((data) => {
            this.isAddingOrEditingProduct = false;
            this.msg.info(this.isAddModal ? '添加商品信息成功!' : '修改商品信息成功!');
            this.handleCreateOrEditProductModelHide();
            this.loadProductList();
        }, (err) => {
            this.isAddingOrEditingProduct = false;
            this.msg.info(this.isAddModal ? '添加商品信息失败!' : '修改商品信息失败!');
        })
    }

    /**
     * （批量）删除商品
     * @param pid 商品ID list
     */
    handleRemoveProduct(pid: number[]) {
        this.isLoadingList = true;
        let removeProductTemplate = {
            id_list: pid
        };
        this._microAppHttpClient.post(Interface.RemoveProductEndPoint, removeProductTemplate).subscribe((data) => {
            this.msg.info('删除商品信息成功!');
            this.loadProductList();
        }, (err) => {
            this.msg.error('删除商品信息失败, 请重新删除!');
        });
    }

    /**
     * （批量）上架 / （批量）下架 商品
     * @param pid 商品ID list
     * @tag true 代表上架 ; false 代表下架
     */
    handleDownOrUpProduct(pid: number[], tag: boolean) {
        this.isLoadingList = true;
        let changeProductStatusTemplate = {
            id_list: pid,
            status: tag ? 1 : 0
        };
        this._microAppHttpClient.post(Interface.ChangeProductStatusEndPoint, changeProductStatusTemplate).subscribe((data) => {
            this.msg.info(`${tag ? '上架' : '下架'}商品成功!`);
            this.loadProductList();
        }, (err) => {
            this.msg.error(`${tag ? '上架' : '下架'}商品失败, 请重新操作!`);
        });
    }

    /**
     * 批量修改库存 相关参数
     */
    batchModifyModalShow: boolean = false;
    modifyProductStockSchema: SFSchema = {
        properties: {
            stock: {
                type: 'number',
                title: '库存设置',
                minimum: 0,
                description: '提交后, 勾选的商品不管是单规格还是多规格库存都会改成设置的库存.',
                default: 0
            }
        },
        required: ['stock']
    };
    modifyProductStockFormData: any;
    modifyProductStockSubmitting: boolean = false;

    /**
     * 响应点击批量修改库存按钮事件
     */
    handleClickBatchModifyProductStockButton() {
        this.modifyProductStockFormData = {
            stock: 0
        };
        this.batchModifyModalShow = true;
    }

    /**
     * 响应关闭修改库存模态框
     */
    handleBatchModifyModalCancel() {
        this.batchModifyModalShow = false;
    }

    /**
     * （批量）修改库存
     * @param value
     */
    handleBatchModifyProductStockSubmit(value: any) {
        this.modifyProductStockSubmitting = true;
        let changeProductStockTemplate = {
            id_list: this.getCheckBoxSelectedIDList(),
            stock: value.stock
        };
        this._microAppHttpClient.post(Interface.ChangeProductStockEndPoint, changeProductStockTemplate).subscribe((data) => {
            this.msg.info(`商品库存修改成功!`);
            this.modifyProductStockSubmitting = false;
            this.batchModifyModalShow = false;
            this.loadProductList();
        }, (err) => {
            this.modifyProductStockSubmitting = false;
            this.msg.error(`商品库存修改失败失败, 请重新操作!`);
        });
    }

    /**
     * 响应产品列表选择框
     * @param e
     */
    handleCheckBoxSelected(e: STChange) {
        if (e.type == 'checkbox') {
            this.checkboxSelectedList = e.checkbox;
        }
    }

    /**
     * 得到Checkbox 选中的 商品ID List
     */
    getCheckBoxSelectedIDList(): number[] {
        let pids: number[] = [];
        this.checkboxSelectedList.forEach((item) => {
            pids.push(parseInt(item['id']));
        });
        return pids;
    }

}
