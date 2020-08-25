import {Component, OnInit, ViewChild} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {UploadIconService} from "@shared/service/upload-icon.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {
    SFCascaderWidgetSchema,
    SFComponent,
    SFSchema,
    SFSelectWidgetSchema,
    SFStringWidgetSchema,
    SFUploadWidgetSchema
} from "@delon/form";

@Component({
    selector: 'micro-recommend',
    templateUrl: './recommend.component.html',
    styleUrls: ['./recommend.component.less']
})
export class RecommendComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private _uploadIconService: UploadIconService
    ) {
        this._uploadIconService.maxUploadLimit = 1;
        this._uploadIconService.minUploadLimit = 1;
    }

    isLoadingList = false;
    recommendList = [];

    isLoadingCategory = false;

    // 添加/修改 轮播图设置
    addOrEditRecommendModalVisible = false;
    isAddModal = true;
    recommendFormData: any;
    typeList = [];
    isAddingOrEditingRecommend = false;
    editRecommendLabel = 0;
    @ViewChild('sf', {static: false}) sf: SFComponent;
    recommendSchema: SFSchema = {
        properties: {
            type: {
                type: 'number',
                title: '选择分类',
                enum: [],
                ui: {
                    widget: 'select',
                    change: ngModel => {
                        this.syncTitleAndIcon(ngModel)
                    }
                } as SFSelectWidgetSchema
            },
            title: {
                type: 'string',
                title: '标题',
                ui: {
                    change: val => console.log(val),
                } as SFStringWidgetSchema
            },
            rank: {
                type: 'integer',
                title: '排序'
            },
            icon: {
                type: 'string',
                title: '首页分类图片',
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
            status: {
                type: 'boolean',
                title: '是否显示',
                ui: {
                    checkedChildren: '是',
                    unCheckedChildren: '否',
                }
            }
        },
        required: ['title', 'rank', 'type', 'icon']
    };

    ngOnInit() {
        this.loadRecommendList();
    }

    loadRecommendList() {
        this.isLoadingList = true;
        this._microAppHttpClient.get(Interface.LoadRecommendListEndPoint).subscribe((data) => {
            if (data) {
                this.recommendList = data;
                this.recommendList.forEach((item) => {
                    item.cover = environment.ICON_URL + '/' + item.main_image;
                });
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('加载首页分类列表失败!');
        }, () => {
            this.loadCategoryList();
        });
    }

    loadCategoryList() {
        this.isLoadingCategory = true;
        this.typeList = [];
        this._microAppHttpClient.get(Interface.LoadProductCategoryListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    this.typeList.push({
                        label: item.cname,
                        value: parseInt(item.clabel),
                        main_image: item.cicon,
                        cover: environment.ICON_URL + '/' + item.cicon
                    });
                });
            }
            this.isLoadingCategory = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingCategory = false;
        })
    }

    deleteRecommend(id: number) {
        const deleteRecommendTemplate = {
            home_cat_id: id
        };
        this.isLoadingList = true;
        this._microAppHttpClient.post(Interface.DeleteRecommendEndPoint, deleteRecommendTemplate).subscribe((data) => {
            this.msg.info('删除首页分类成功!');
            this.loadRecommendList();
        }, (err) => {
            this.isLoadingList = false;
            this.msg.error('删除首页分类失败，请重试!');
        })
    }

    editRecommend(item: any) {
        this.isAddModal = false;
        this.handleAddOrEditRecommendFormDataInit(item);
        this.handleShowAddOrEditRecommendModal();
    }

    handleShowAddOrEditRecommendModal() {
        if (this.isAddModal) {
            this.handleAddOrEditRecommendFormDataInit();
        }
        this.addOrEditRecommendModalVisible = true;
    }

    handleHideAddOrEditRecommendModal() {
        this.isAddModal = true;
        this.handleAddOrEditRecommendFormDataInit();
        this.addOrEditRecommendModalVisible = false;
    }

    handleAddOrEditRecommendFormDataInit(e: any = {}) {
        this.recommendSchema.properties.type.enum = this.typeList;
        if (this.isAddModal) {
            this.recommendFormData = {
                title: '',
                rank: 0,
                status: false
            };
            this._uploadIconService.emptyIconList();
        } else {
            this.editRecommendLabel = parseInt(e.id);
            const linkurl = e.link;
            this.recommendFormData = {
                title: e.title,
                rank: e.sort,
                type: parseInt(linkurl.split('=')[1]),
                status: e.status == 1
            };
            if (e.main_image) {
                this._uploadIconService.addIcon(e.main_image);
            }
        }
        if (e.main_image) {
            const icons = [];
            icons.push({
                uid: -1,
                name: 'xxx.png',
                status: 'done',
                url: e.cover,
                response: {
                    resource_id: 1,
                },
            });
            this.recommendSchema.properties.icon.enum = icons;
        } else {
            this.recommendSchema.properties.icon.enum = null;
        }
    }

    disableCreateOrEditRecommendSubmitButton(sf: SFComponent): boolean {
        return !sf.valid || this._uploadIconService.isUploding || this._uploadIconService.iconList.length < this._uploadIconService.minUploadLimit;
    }

    handleCreateOrEditRecommendSubmit(value: any): void {
        const recommendTemplate = {
            home_cat_id: this.isAddModal ? 0 : this.editRecommendLabel,
            title: value.title,
            sort: value.rank,
            link_id: value.type,
            main_image: this._uploadIconService.iconList[0] ? this._uploadIconService.iconList[0] : '',
            status: value.status ? 1 : 0
        };
        this.isAddingOrEditingRecommend = true;
        this._microAppHttpClient.post(Interface.AddOrEditRecommendEndPoint, recommendTemplate).subscribe((data) => {
            this.isAddingOrEditingRecommend = false;
            this.msg.info(this.isAddModal ? '添加首页分类信息成功!' : '修改首页分类信息成功!');
            this.handleHideAddOrEditRecommendModal();
            this.loadRecommendList();
        }, (err) => {
            this.isAddingOrEditingRecommend = false;
            this.msg.error(this.isAddModal ? '添加首页分类信息失败!' : '修改首页分类信息失败!');
        })
    }

    private syncTitleAndIcon(catLabel: number): void {
        const titleProperty = this.sf.getProperty('/title');
        const iconProperty = this.sf.getProperty('/icon');

        let category;

        this.typeList.forEach((item) => {
            if (item.value == catLabel) {
                category = item;
            }
        });

        if (category.main_image) {
            this._uploadIconService.emptyIconList();
            this._uploadIconService.addIcon(category.main_image);

            const icons = [];
            icons.push({
                uid: -1,
                name: 'xxx.png',
                status: 'done',
                url: category.cover,
                response: {
                    resource_id: 1,
                },
            });
            // iconProperty.schema.enum = icons;
            iconProperty.resetValue(icons, false);
        }

        titleProperty.setValue(category.label, true);


    }

}
