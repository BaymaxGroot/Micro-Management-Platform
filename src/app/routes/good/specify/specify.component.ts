import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {UploadIconService} from "@shared/service/upload-icon.service";
import {STColumn, STData} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {
    FormProperty,
    PropertyGroup,
    SFComponent, SFRadioWidgetSchema,
    SFSchema,
    SFSelectWidgetSchema,
    SFUploadWidgetSchema
} from "@delon/form";
import {of} from "rxjs";
import {delay} from "rxjs/operators";

@Component({
    selector: 'micro-specify',
    templateUrl: './specify.component.html',
    styleUrls: ['./specify.component.less']
})
export class SpecifyComponent implements OnInit {

    constructor(
        private fb: FormBuilder,
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        private _microAppHttpClient: MicroAppService,
        private _uploadIconService: UploadIconService
    ) {
        this._uploadIconService.maxUploadLimit = 1;
    }

    ngOnInit() {
        this.loadSpecifyList();
        this.loadProductList();
    }

    /**
     *
     */
    isLoadingList = true;
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'spec_id', format: (item) => {
                return 'S' + item['spec_id'];
            }
        },
        {title: '图标', index: 'image', type: 'img', width: 100},
        {
            title: '规格名称', index: 'spec_name', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.spec_name.indexOf(filter.value) !== -1
                },
            },
        },
        {
            title: '所属商品名称', index: 'product_name', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.product_name.indexOf(filter.value) !== -1
                },
            },
        },
        {
            title: '操作', buttons: [
                {
                    text: '修改',
                    type: 'none',
                    click: (e: any) => {
                        this.isAddModal = false;
                        this.handleAddOrEditFormDataInit(e);
                        this.showAddSpecifyModal();
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (e: any) => {
                        this.handleRemoveSpecify(parseInt(e['spec_id']));
                    }
                },
            ]
        }
    ];
    specifyListData: STData[] = [];

    loadSpecifyList(): void {
        this.isLoadingList = true;
        this.specifyListData = [];
        this._microAppHttpClient.get(Interface.LoadSpecifyListEndPoint).subscribe((data) => {
            if (data) {
                this.specifyListData = data;
                this.specifyListData.forEach((item) => {
                    if (item['image']) {
                        item['imagename'] = item['image'];
                        item['image'] = environment.SERVER_URL + '/static/upload/' + item['image'];
                    }
                });
            }
            this.isLoadingList = false;
        }, (err) => {

        })
    }

    productListData = [];
    isLoadingProduct: boolean = false;

    loadProductList(): void {
        this.isLoadingProduct = true;
        this._microAppHttpClient.get(Interface.LoadProductListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    this.productListData.push({
                        label: item['name'],
                        value: parseInt(item['id'])
                    });
                });
            }
            this.isLoadingProduct = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingProduct = false;
        });
    }

    /**
     * 添加 、 编辑 规格
     */
    addOrEditSpecifyModalVisible: boolean = false;
    isAddModal = true;

    showAddSpecifyModal(): void {
        if (this.isAddModal) {
            this.handleAddOrEditFormDataInit();
        }
        this.addOrEditSpecifyModalVisible = true;
    }

    handleCreateSpecifyCancel(): void {
        this.isAddModal = true;
        this.handleAddOrEditFormDataInit();
        this.addOrEditSpecifyModalVisible = false;
    }

    handleAddOrEditFormDataInit(e: any = {}): void {
        this._uploadIconService.emptyIconList();
        if (this.isAddModal) {
            this.specifyFormData = {
                product_id: 0,
                name: '',
                price: 0,
                original_price: 0,
                stock: 0,
                weight: 0,
                max_buy_num: 0,
                min_buy_num: 0
            }
        } else {
            this.editSpecifyLabel = parseInt(e['spec_id']);
            this.specifyFormData = {
                product_id: e['product_id'],
                name: e['spec_name'],
                price: e['price'],
                original_price: e['original_price'],
                stock: e['stock'],
                weight: e['weight'],
                max_buy_num: e['max_buy_num'],
                min_buy_num: e['min_buy_num']
            };
            if (e['imagename']) {
                this._uploadIconService.addIcon(e['imagename']);
            }
        }
        if (e['imagename']) {
            let icons = [];
            icons.push({
                uid: -1,
                name: e['imagename'],
                status: 'done',
                url: e['image'],
                response: {
                    resource_id: 1,
                },
            });
            this.specifySchema.properties.image.enum = icons;
        } else {
            this.specifySchema.properties.image.enum = null;
        }
    }

    specifyFormData: any;
    specifySchema: SFSchema = {
        properties: {
            product_id: {
                type: 'integer',
                title: '所属商品',
                ui: {
                    widget: 'select',
                    asyncData: () =>
                        of(this.productListData).pipe(delay(10)),
                } as SFSelectWidgetSchema
            },
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
            },
            min_buy_num: {
                type: 'number',
                title: '起购',
                minimum: 0
            },
            image: {
                type: 'string',
                title: '商品图片',
                enum: [],
                ui: {
                    widget: 'upload',
                    validator: (value: any, formProperty: FormProperty, form: PropertyGroup) => {
                        return [];
                    },
                    action: `${environment.SERVER_URL}${Interface.UploadImage}`,
                    listType: 'picture-card',
                    showUploadList: true,
                    beforeUpload: (file, fileList) => {
                        return this._uploadIconService.handleBeforeUpload(file, fileList);
                    },
                    change: (args) => {
                        return this._uploadIconService.handleUploadSuccess(args);
                    },
                    customRequest: (item) => {
                        return this._uploadIconService.uploadImage(item);
                    },
                    remove: (file) => {
                        return this._uploadIconService.handleDeleteIcon(file);
                    }
                } as SFUploadWidgetSchema
            },
        },
        ui: {},
        required: ['product_id', 'name', 'price', 'ori_price', 'stock', 'weight', 'max_buy_num', 'min_buy_num']
    };
    isAddingOrEditingSpecify: boolean = false;
    editSpecifyLabel: number = 0;

    disableCreateOrEditSpecifySubmitButton(sf: SFComponent): boolean {
        return !sf.valid || this._uploadIconService.isUploding;
    }

    handleCreateOrEditSpecifySubmit(value): void {
        let specifyTemplate = {
            product_id: value['product_id'],
            spec_id: this.isAddModal ? 0 : this.editSpecifyLabel,
            name: value['name'],
            price: value['price'],
            original_price: value['original_price'],
            stock: value['stock'],
            max_buy_num: value['max_buy_num'],
            min_buy_num: value['min_buy_num'],
            image: this._uploadIconService.iconList[0] ? this._uploadIconService.iconList[0] : '',
            weight: value['weight']
        };
        this.isAddingOrEditingSpecify = true;
        this._microAppHttpClient.post(Interface.AddOrModifySpecifyEndPoint, specifyTemplate).subscribe((data) => {
            this.isAddingOrEditingSpecify = false;
            this.msg.info(this.isAddModal ? '添加商品规格信息成功!' : '修改商品规格信息成功!');
            this.handleCreateSpecifyCancel();
            this.loadSpecifyList();
        }, (err) => {
            this.isAddingOrEditingSpecify = false;
            this.msg.error(this.isAddModal ? '添加商品规格信息失败!' : '修改商品规格信息失败!');
        });
    }

    handleRemoveSpecify(label: number): void {
        this.isLoadingList = true;
        let removeSpecifyTemplate = {
            spec_id: label
        };
        this._microAppHttpClient.post(Interface.DeleteSpecifyEndPoint, removeSpecifyTemplate).subscribe((data) => {
            this.msg.info('删除规格信息成功!');
            this.loadSpecifyList();
        }, (err) => {
            this.msg.error('删除规格失败, 请重试!');
        });
    }
}
