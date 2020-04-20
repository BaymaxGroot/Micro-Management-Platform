import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {STColumn, STColumnBadge, STData} from "@delon/abc";
import {FormBuilder} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {SFComponent, SFSchema, SFSchemaEnumType, SFSelectWidgetSchema, SFUploadWidgetSchema} from "@delon/form";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {of} from "rxjs";
import {delay} from "rxjs/operators";
import {UploadIconService} from "@shared/service/upload-icon.service";

const BADGE: STColumnBadge = {
    False: {text: '隐藏', color: 'default'},
    True: {text: '显示', color: 'success'},
};

@Component({
    selector: 'micro-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.less']
})
export class CategoryComponent implements OnInit {

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
        this.loadCategoryList();
    }

    /**
     * 分类列表设置
     *
     */
    isLoadingList = true;
    categoryFilterList = [];
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'clabel', format: (item) => {
                return 'T' + item['clabel'];
            }
        },
        {title: '分类名称', index: 'cname'},
        {title: '图标', index: 'cicon', type: 'img', width: 100},
        {title: '显示', index: 'cshow', type: 'badge', badge: BADGE},
        {title: '排序', index: 'crank'},
        {
            title: '所属分类', index: 'root', filter: {
                menus: [],
                fn: (filter, record) => {
                    return !filter.value || record.root.indexOf(filter.value) !== -1 || record.cname.indexOf(filter.value) !== -1;
                }
            }
        },
        {
            title: '操作', buttons: [
                {
                    text: '修改',
                    type: 'none',
                    click: (e: any) => {
                        this.isAddModal = false;
                        this.handleAddOrEditFormDataInit(e);
                        this.showAddCategoryModal();
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (e: any) => {
                        this.handleRemoveCategory(parseInt(e['clabel']));
                    }
                },
            ]
        }
    ];
    categoryListData: STData[] = [];
    categoryRootList = [];

    /**
     * 加载分类列表
     */
    loadCategoryList(): void {
        this.isLoadingList = true;
        this.categoryRootList = [];
        this._microAppHttpClient.get(Interface.LoadProductCategoryListEndPoint).subscribe((data) => {
            if (data) {
                this.categoryListData = data;
                this.categoryListData.forEach((item) => {
                    item['iconname'] = item['cicon'];
                    if (item['cicon']) {
                        item['cicon'] = environment.SERVER_URL + '/static/upload/' + item['cicon'];
                    }
                    if (!item['cparent'] || parseInt(item['cparent']) == 0) {
                        this.categoryRootList.push({
                            label: item['cname'],
                            value: parseInt(item['clabel'])
                        });
                    }
                    if (item['root']) {
                        let flag = true;
                        this.categoryFilterList.forEach((ca) => {
                            if (ca.text == item['root']) {
                                flag = false;
                                return;
                            }
                        });
                        if (flag) {
                            this.categoryFilterList.push({
                                text: item['root'], value: item['root']
                            });
                        }
                    }
                });
                this.categoryRootList.unshift({
                    label: '无',
                    value: 0
                });
                this.columnsSetting.forEach((item) => {
                    if (item.title == '所属分类') {
                        item.filter.menus = this.categoryFilterList;
                    }
                });
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

    /**
     * 添加分类模态框
     */
    addOrEditCategoryModalVisible: boolean = false;
    isAddModal = true;

    /**
     * 显示 添加/修改 Category 对话框
     */
    showAddCategoryModal(): void {
        if (this.isAddModal) {
            this.handleAddOrEditFormDataInit();
        }
        this.addOrEditCategoryModalVisible = true;
    }

    /**
     * 隐藏 添加/修改 Category 对话框
     */
    handleCreateCategoryCancel(): void {
        this.isAddModal = true;
        this.handleAddOrEditFormDataInit();
        this.addOrEditCategoryModalVisible = false;
    }

    /**
     * 添加或者修改 Category Form 表单数据初始化
     * @param e
     */
    handleAddOrEditFormDataInit(e: any = {}): void {
        this._uploadIconService.emptyIconList();
        if (this.isAddModal) {
            this.categoryFormData = {
                category: 0,
                rank: 1,
                show: false
            };
        } else {
            this.editCategoryLabel = parseInt(e['clabel']);
            this.categoryFormData = {
                category: parseInt(e['cparent']),
                name: e['cname'],
                rank: parseInt(e['crank']),
                show: e['cshow'] !== 'False'
            };
            if (e['iconname']) {
                this._uploadIconService.addIcon(e['iconname']);
            }
        }
        if (e['iconname']) {
            let icons = [];
            icons.push({
                uid: -1,
                name: e['iconname'],
                status: 'done',
                url: e['cicon'],
                response: {
                    resource_id: 1,
                },
            });
            this.categorySchema.properties.icon.enum = icons;
        } else {
            this.categorySchema.properties.icon.enum = null;
        }
    }

    /**
     * 添加或者编辑分类表单
     *
     */
    categoryFormData: any;
    categorySchema: SFSchema = {
        properties: {
            category: {
                type: 'string',
                title: '父级分类',
                ui: {
                    widget: 'select',
                    asyncData: () =>
                        of(this.categoryRootList).pipe(delay(10))
                } as SFSelectWidgetSchema
            },
            name: {
                type: 'string',
                title: '分类名称'
            },
            rank: {
                type: 'integer',
                title: '排序',
                minimum: 1,
                description: '排序值越小排序越靠前'
            },
            icon: {
                type: 'string',
                title: '分类图标',
                ui: {
                    widget: 'upload',
                    action: `${environment.SERVER_URL}${Interface.UploadImage}`,
                    listType: 'picture-card',
                    showUploadList: true,
                    beforeUpload: (file, fileList) => {
                        return this._uploadIconService.handleBeforeUpload(file, fileList);
                    },
                    change: (args) => {
                        this._uploadIconService.handleUploadSuccess(args);
                    },
                    customRequest: (item) => {
                        return this._uploadIconService.uploadImage(item);
                    },
                    remove: (file) => {
                        return this._uploadIconService.handleDeleteIcon(file);
                    }
                } as SFUploadWidgetSchema
            },
            show: {
                type: 'boolean',
                title: '是否显示',
                ui: {
                    checkedChildren: '显示',
                    unCheckedChildren: '隐藏',
                }
            }
        },
        required: ['category', 'name', 'rank']
    };
    isAddingOrEditingCategory: boolean = false;
    editCategoryLabel: number = 0;

    /**
     * Submit 按钮是否可用
     * @param sf
     */
    disableCreateOrEditCategorySubmitButton(sf: SFComponent): boolean {
        return !sf.valid || this._uploadIconService.isUploding;
    }

    /**
     * 添加/修改 Category
     * @param value
     */
    handleCreateOrEditCategorySubmit(value: any): void {
        let categoryTemplate = {
            clabel: this.isAddModal ? 0 : this.editCategoryLabel,
            cname: value['name'] ? value['name'] : 0,
            cicon: this._uploadIconService.iconList[0] ? this._uploadIconService.iconList[0] : '',
            cshow: value['show'] ? value['show'] : 0,
            crank: value['rank'] ? value['rank'] : 1,
            cparent: value['category'] ? value['category'] : 0
        };
        this.isAddingOrEditingCategory = true;
        this._microAppHttpClient.post(Interface.AddOrEditProductCategoryInfoEndPoint, categoryTemplate).subscribe((data) => {
            this.isAddingOrEditingCategory = false;
            this.msg.info(this.isAddModal ? '添加分类信息成功!' : '修改分类信息成功!');
            this.handleCreateCategoryCancel();
            this.loadCategoryList();
        }, (err) => {
            this.isAddingOrEditingCategory = false;
            this.msg.error(this.isAddModal ? '添加分类信息失败!' : '修改分类信息失败!');
        })
    }

    /**
     * 删除Category
     * @param label
     */
    handleRemoveCategory(label: number) {
        this.isLoadingList = true;
        let removeCategoryTemplate = {
            clabel: label
        };
        this._microAppHttpClient.post(Interface.RemoveProductCategoryEndPoint, removeCategoryTemplate).subscribe((data) => {
            this.msg.info('删除分类信息成功!');
            this.loadCategoryList();
        }, (err) => {
            this.msg.error('删除分类信息失败, 请重新删除!');
        })
    }

}
