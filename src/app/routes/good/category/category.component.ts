import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {STColumn, STColumnBadge, STData} from "@delon/abc";
import {FormBuilder} from "@angular/forms";
import {NzMessageService, UploadFile} from "ng-zorro-antd";
import {SFSchema, SFSelectWidgetSchema, SFUploadWidgetSchema} from "@delon/form";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse} from "@angular/common/http";
import {environment} from "@env/environment";
import {DomSanitizer} from "@angular/platform-browser";
import {of} from "rxjs";
import {delay} from "rxjs/operators";

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

    /**
     * Loading Product List Tag
     */
    isLoadingList = true;

    constructor(private fb: FormBuilder,
                private msg: NzMessageService,
                private cdr: ChangeDetectorRef,
                private _microAppHttpClient: MicroAppService,
                private http: HttpClient,
                private sanitizer: DomSanitizer) {
    }

    /**
     * 分类列表设置
     */
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'clabel', format: (item) => {
                return 'JYS' + item['clabel'];
            }
        },
        {title: '分类名称', index: 'cname'},
        {title: '图标', index: 'cicon', type: 'img', width: 100},
        {title: '显示', index: 'cshow', type: 'badge', badge: BADGE},
        {title: '排序', index: 'crank'},
        {
            title: '操作', buttons: [
                {
                    text: '查看商品列表',
                    type: 'modal',
                    click: (e: any) => {
                        console.log('编辑被点击');
                    }
                },
                {
                    text: '修改',
                    type: 'modal',
                    click: (e: any) => {
                        this.editCategoryLabel = parseInt(e['clabel']);
                        this.categoryFormData = {
                            category: parseInt(e['cparent']),
                            name: e['cname'],
                            rank: parseInt(e['crank']),
                            icon: {
                                status: 'done',
                                url: e['cicon'],
                                name: e['cname']
                            },
                            show: e['cshow'] !== 'False'
                        };
                        this.categoryIconFileList = [{
                            uid: -1,
                            name: 'xxx.png',
                            status: 'done',
                            url: e['cicon']
                        }];
                        this.showAddCategoryModal();
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (e: any) => {
                        const clable = e['clabel'];
                        this.handleRemoveCategory(parseInt(clable));
                    }
                },
            ]
        }
    ];
    categoryListData: STData[] = [];
    categoryRootList = [];

    ngOnInit() {
        this.loadCategoryList();
    }

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
                    if (item['cicon']) {
                        item['cicon'] = environment.SERVER_URL + '/static/upload/' + item['cicon'];
                    }
                });
                data.forEach((item) => {
                    if (!item['cparent'] || parseInt(item['cparent']) == 0) {
                        this.categoryRootList.push({
                            label: item['cname'],
                            value: item['clabel']
                        });
                    }
                });
                this.categoryRootList.unshift({
                    label: '无',
                    value: 0
                });
            }
            setTimeout(() => {
                this.isLoadingList = false;
            }, 1000);
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

    /**
     * 添加分类模态框
     */
    addOrEditCategoryModalVisible = false;
    isAddModal = true;

    showAddCategoryModal(): void {
        this.categorySchema.properties.icon.enum = this.categoryIconFileList;
        this.addOrEditCategoryModalVisible = true;
    }

    handleCreateCategoryCancel(): void {
        this.isAddModal = true;
        this.categoryFormData = {
            category: 0
        };
        this.addOrEditCategoryModalVisible = false;
    }

    /**
     * 添加或者编辑分类表单
     *
     */
    categoryFormData: any = {
        category: 0
    };
    categoryIconFileList: any[];
    categorySchema: SFSchema = {
        properties: {
            category: {
                type: 'string',
                title: '父级分类',
                default: 0,
                ui: {
                    widget: 'select',
                    asyncData: () =>
                        of([
                            {
                                label: '父级分类',
                                group: true,
                                children: this.categoryRootList,
                            },
                        ]).pipe(delay(200))
                } as SFSelectWidgetSchema
            },
            name: {
                type: 'string',
                title: '分类名称'
            },
            rank: {
                type: 'number',
                title: '排序',
                minimum: 2,
                description: '排序值越小排序越靠前'
            },
            icon: {
                type: 'string',
                title: '分类图标',
                enum: this.categoryIconFileList,
                ui: {
                    widget: 'upload',
                    action: `${environment.SERVER_URL}/api${Interface.UploadImage}`,
                    urlReName: 'url',
                    listType: 'picture-card',
                    showUploadList: true,
                    beforeUpload: (file, fileList) => {
                        let isJPG = false;
                        ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'].forEach((item) => {
                            if (item == file.type) {
                                isJPG = true;
                            }
                        });
                        if (!isJPG) {
                            this.msg.error('目前只支持选择JPG/PNG/GIF/JPEG!');
                            return false;
                        }
                        if (fileList.length > 1) {
                            this.msg.error('请先删除已有的图片!');
                            return false;
                        }
                    },
                    change: (args) => {
                        // if (args.type == 'success') {
                        //     args.fileList[0].url = this.sanitizer.bypassSecurityTrustResourceUrl(args.file.response.url).toString();
                        //     args.fileList[0].filename = args.file.response.name;
                        // }
                    },
                    customRequest: (item) => {
                        // Create a FormData here to store files and other parameters.
                        const formData = new FormData();
                        // tslint:disable-next-line:no-any
                        formData.append('file', item.file as any);
                        const httpHeaders = new HttpHeaders({
                            'Authorization': environment.AUTH,
                        });

                        const req = new HttpRequest('POST', item.action!, formData, {
                            headers: httpHeaders,
                            reportProgress: true,
                            withCredentials: true
                        });

                        return this.http.request(req).subscribe(
                            // tslint:disable-next-line no-any
                            (event: HttpEvent<any>) => {
                                if (event.type === HttpEventType.UploadProgress) {
                                    if (event.total! > 0) {
                                        // tslint:disable-next-line:no-any
                                        (event as any).percent = (event.loaded / event.total!) * 100;
                                    }
                                    item.onProgress!(event, item.file!);
                                } else if (event instanceof HttpResponse) {
                                    item.onSuccess!(event.body, item.file!, event);
                                }
                            },
                            err => {
                                item.onError!(err, item.file!);
                            }
                        );
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
    isAddingOrEditingCategory = false;
    editCategoryLabel: number = 0;

    handleCreateOrEditCategorySubmit(value: any): void {
        let categoryTemplate = {
            clabel: this.editCategoryLabel,
            cname: value['name'] ? value['name'] : 0,
            cicon: value['icon'] ? value['icon'].url : '',
            cshow: value['show'] ? value['show'] : 0,
            crank: value['rank'] ? value['rank'] : 2,
            cparent: value['category'] ? value['category'] : 0
        };
        this.isAddingOrEditingCategory = true;
        this._microAppHttpClient.post(Interface.AddOrEditProductCategoryInfoEndPoint, categoryTemplate).subscribe((data) => {
            this.isAddingOrEditingCategory = false;
            this.msg.info('添加分类信息成功!');
            this.handleCreateCategoryCancel();

            this.loadCategoryList();
        }, (err) => {
            this.isAddingOrEditingCategory = false;
            this.msg.error('添加分类信息失败, 请重新添加!');
        })
    }

    handleRemoveCategory(label: number) {
        let removeCategoryTemplate = {
            clabel: label
        };
        this.isLoadingList = true;
        this._microAppHttpClient.post(Interface.RemoveProductCategoryEndPoint, removeCategoryTemplate).subscribe((data) => {
            this.msg.info('删除分类信息成功!');
            this.loadCategoryList();
        }, (err) => {
            this.msg.error('删除分类信息失败, 请重新删除!');
        })
    }

}
