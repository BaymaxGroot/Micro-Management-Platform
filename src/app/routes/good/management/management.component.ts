import {Component, OnInit} from '@angular/core';
import {STChange, STColumn, STColumnTag, STData} from "@delon/abc";
import {FormBuilder} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {UploadIconService} from "@shared/service/upload-icon.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {SFSchema} from "@delon/form";

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

    constructor(
        private fb: FormBuilder,
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private _uploadIconService: UploadIconService
    ) {
        this._uploadIconService.maxUploadLimit = 1;
    }

    ngOnInit() {
        this.loadProductList();
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
        {title: '商品图片', index: 'main_image', type: 'img'},
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
                    }
                },
                // {
                //     text: '显示链接', type: 'none', click: (record, modal, instance) => {
                //         this.pname = record.name;
                //         this.plink = record.
                //     }
                // },
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

        this._microAppHttpClient.get(Interface.LoadProductListEndPoint).subscribe((data) => {
            if (data) {
                this.productListData = data;
                this.productListData.forEach((item) => {
                    item['check'] = 0;
                    if (item['main_image']) {
                        item['main_image'] = environment.SERVER_URL + '/static/upload/' + item['main_image'];
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
     * 打开添加商品 对话框
     */
    handleCreateOrEditProductModelShow() {

    }

    /**
     * 隐藏添加商品 对话框
     */
    handleCreateOrEditProductModelHide() {

    }

    /**
     * 添加商品 / 修改商品 表单数据初始化
     */
    handleAddOrEditProductFormDataInit() {

    }

    /**
     * 添加或者编辑商品表单
     */

    /**
     * Submit 按钮是否可用
     */
    disableCreateOrEditProductSubmitButton() {
    }

    /**
     * 添加 / 修改商品
     */
    handleCreateOrEditProductSubmit(value: any) {

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
     * 批量修改库存 模块
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

    handleClickBatchModifyProductStockButton() {
        this.modifyProductStockFormData = {
            stock: 0
        };
        this.batchModifyModalShow = true;
    }

    handleBatchModifyModalCancel() {
        this.batchModifyModalShow = false;
    }

    /**
     * 批量修改库存
     * @param value
     */
    handleBatchModifyProductStockSubmit(value: any) {
        this.modifyProductStockSubmitting = true;
        let changeProductStockTemplate = {
            id_list: this.getCheckBoxSelectedIDList(),
            stock: value.stock
        };
        this._microAppHttpClient.post(Interface.ChangeProductStockEndPoint, changeProductStockTemplate).subscribe( (data) => {
            this.msg.info(`商品库存修改成功!`);
            this.modifyProductStockSubmitting = false;
            this.batchModifyModalShow = false;
            this.loadProductList();
        }, (err) => {
            this.modifyProductStockSubmitting = false;
            this.msg.error(`商品库存修改失败失败, 请重新操作!`);
        } );
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
