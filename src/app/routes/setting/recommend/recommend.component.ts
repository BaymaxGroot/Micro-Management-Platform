import { Component, OnInit } from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {UploadIconService} from "@shared/service/upload-icon.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {SFCascaderWidgetSchema, SFComponent, SFSchema, SFSelectWidgetSchema, SFUploadWidgetSchema} from "@delon/form";

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

    ngOnInit() {
        this.loadRecommendList();
    }

    isLoadingList: boolean = false;
    recommendList = [];

    loadRecommendList() {
        this.isLoadingList = true;
        this._microAppHttpClient.get(Interface.LoadRecommendListEndPoint).subscribe((data) => {
            if (data) {
                this.recommendList = data;
                this.recommendList.forEach((item) => {
                    item['cover'] = environment.ICON_URL + '/' + item['main_image'];
                });
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('加载首页分类列表失败!');
        }, () => {
            this.loadCategoryList();
        });
    }

    isLoadingCategory: boolean = false;
    loadCategoryList() {
        this.isLoadingCategory = true;
        this.typeList = [];
        this._microAppHttpClient.get(Interface.LoadProductCategoryListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    if(parseInt(item['cparent']) != 0) {
                        this.typeList.push({
                            label: item['cname'],
                            value: parseInt(item['clabel']),
                        })
                    }
                });
            }
            this.isLoadingCategory = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingCategory = false;
        })
    }

    deleteRecommend(id: number) {
        let deleteRecommendTemplate = {
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

    // 添加/修改 轮播图设置
    addOrEditRecommendModalVisible: boolean = false;
    isAddModal = true;
    recommendFormData: any;
    typeList = [];
    isAddingOrEditingRecommend: boolean = false;
    editRecommendLabel: number = 0;
    recommendSchema: SFSchema = {
        properties: {
            title: {
                type: 'string',
                title: '标题'
            },
            rank: {
                type: 'integer',
                title: '排序'
            },
            type: {
                type: 'number',
                title: '跳转类型',
                enum: [],
                ui: {
                    widget: 'select',
                } as SFSelectWidgetSchema
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
            this.editRecommendLabel = parseInt(e['id']);
            let linkurl = e['link'];
            this.recommendFormData = {
                title: e['title'],
                rank: e['sort'],
                type: parseInt(linkurl.split('=')[1]),
                status: e['status'] == 1
            };
            if (e['main_image']) {
                this._uploadIconService.addIcon(e['main_image']);
            }
        }
        if (e['main_image']) {
            let icons = [];
            icons.push({
                uid: -1,
                name: 'xxx.png',
                status: 'done',
                url: e['cover'],
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
        let recommendTemplate = {
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

}
