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

const BADGE: STColumnBadge = {
    0: {text: '隐藏', color: 'default'},
    1: {text: '显示', color: 'success'},
};

@Component({
    selector: 'micro-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.less']
})
export class CategoryComponent implements OnInit {

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
        {title: 'ID', index: 'id'},
        {title: '分类名称', index: 'category'},
        {title: '图标', index: 'icon', type: 'img'},
        {title: '显示', index: 'show', type: 'badge', badge: BADGE},
        {title: '排序', index: 'rank'},
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
                        console.log('编辑被点击');
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (e: any) => {
                        console.log('删除被点击');
                    }
                },
            ]
        }
    ];

    /**
     * 分类列表Mock数据
     */
    mockData: STData[] = [
        {
            'id': 60288,
            'category': '助力抗疫',
            'icon': 'http://b-ssl.duitang.com/uploads/item/201802/20/20180220165946_RiGPS.thumb.700_0.jpeg',
            'show': 1,
            'rank': 1
        },
        {
            'id': 60290,
            'category': '地方名灶',
            'icon': 'http://img5.imgtn.bdimg.com/it/u=1522146444,3890939769&fm=11&gp=0.jpg',
            'show': 0,
            'rank': 2
        }
    ];

    /**
     * 添加分类模态框
     */
    addCategoryModalVisible = false;

    /**
     * 添加分类表单
     *
     * 父级分类 select
     * 分类名称 string
     * 排序 100
     * 分类图标 file image
     */
    iconFileList: UploadFile[] = [];
    categorySchema: SFSchema = {
        properties: {
            category: {
                type: 'string',
                title: '父级分类',
                enum: [
                    {label: '无', value: '0'},
                    {label: '助力抗疫', value: '1'},
                    {label: '新鲜蔬果', value: '2'},
                    {label: '肉类蛋禽', value: '3'}
                ],
                ui: {
                    widget: 'select'
                } as SFSelectWidgetSchema,
                default: '0'
            },
            name: {
                type: 'string',
                title: '分类名称'
            },
            rank: {
                type: 'number',
                title: '排序',
                multipleOf: 4,
                description: '排序值越小排序越靠前'
            },
            icon: {
                type: 'string',
                title: '分类图标',
                ui: {
                    widget: 'upload',
                    action: `${environment.SERVER_URL}${Interface.UploadImage}`,
                    urlReName: 'url',
                    listType: 'picture-card',
                    showUploadList: true,
                    fileList: this.iconFileList,
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
                        if(fileList.length > 1) {
                            this.msg.error('请先删除已有的图片!');
                            return false;
                        }
                    },
                    change: (args) => {
                        if (args.type == 'success') {
                            args.fileList[0].url = this.sanitizer.bypassSecurityTrustResourceUrl(args.file.response.url).toString();
                            args.fileList[0].filename = args.file.response.name;
                        }
                    },
                    headers: (file) => {
                        const httpHeaders = new HttpHeaders({
                            'Access-Control-Allow-Origin': '*',
                            'Authorization': environment.AUTH,
                            'Content-Type': 'application/json'
                        });
                        file.headers = httpHeaders;
                    },
                    customRequest: (item) => {
                        // Create a FormData here to store files and other parameters.
                        const formData = new FormData();
                        // tslint:disable-next-line:no-any
                        formData.append('file', item.file as any);
                        const httpHeaders = new HttpHeaders({
                            'Authorization': environment.AUTH
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
        required: ['name', 'rank']
    };

    ngOnInit() {
        // this.addCategoryForm = this.fb.group({
        //     name: [null, [Validators.required]],
        //     rank: [null, [Validators.required]],
        //     icon: [null, []],
        //     show: [1, [Validators.min(0), Validators.max(1)]]
        // });
    }

    showAddCategoryModal(): void {
        this.addCategoryModalVisible = true;
    }

    handleCreateCategoryCancel(): void {
        this.addCategoryModalVisible = false;
    }

    handleCreateCategorySubmit(value: any): void {
        // this.addCategorySubmitting = true;
        // setTimeout(() => {
        //     this.addCategorySubmitting = false;
        //     this.msg.success('添加成功！');
        //     this.cdr.detectChanges();
        // }, 1000);
    }

}
