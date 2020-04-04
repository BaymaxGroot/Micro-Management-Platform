import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {SFCascaderWidgetSchema, SFComponent, SFSchema, SFUploadWidgetSchema} from "@delon/form";
import {UploadIconService} from "@shared/service/upload-icon.service";

@Component({
    selector: 'micro-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.less']
})
export class CarouselComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private _uploadIconService: UploadIconService
    ) {
        this._uploadIconService.maxUploadLimit = 1;
    }

    ngOnInit() {
        this.loadBannerList();
    }

    isLoadingList: boolean = false;
    bannerList = [];

    loadBannerList() {
        this.isLoadingList = true;
        this._microAppHttpClient.get(Interface.LoadCarouselListEndPoint).subscribe((data) => {
            if (data) {
                this.bannerList = data;
                this.bannerList.forEach((item) => {
                    item['cover'] = environment.SERVER_URL + '/static/upload/' + item['main_image'];
                });
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('加载轮播图列表失败!');
        }, () => {
            this.loadCategoryList();
        });
    }

    isLoadingCategory: boolean = false;

    loadCategoryList() {
        this.isLoadingCategory = true;
        this._microAppHttpClient.get(Interface.LoadProductCategoryListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    this.typeList.push({
                        label: item['cname'],
                        value: parseInt(item['clabel']),
                        parent: -11,
                        isLeaf: true
                    })
                });
            }
            this.isLoadingCategory = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingCategory = false;
        }, () => {
            this.loadProductList();
        })
    }

    isLoadingProduct: boolean = false;

    loadProductList() {
        this.isLoadingProduct = true;
        this._microAppHttpClient.get(Interface.LoadProductListEndPoint).subscribe((data) => {
            if (data) {
                data.forEach((item) => {
                    this.typeList.push({
                        label: item['name'],
                        value: parseInt(item['id']),
                        parent: -12,
                        isLeaf:true
                    })
                });
            }
            this.isLoadingProduct = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingProduct = false;
        })
    }

    getLinkType(type): string {
        switch (type) {
            case 0:
                return '无';
            case 1:
                return '商品列表';
            case 2:
                return '商品详情';
        }
    }

    deleteBanner(id: number) {
        let deleteBannerTemplate = {
            banner_id: id
        };
        this.isLoadingList = true;
        this._microAppHttpClient.post(Interface.DeleteCarouselEndPoint, deleteBannerTemplate).subscribe((data) => {
            this.msg.info('删除轮播图成功!');
            this.loadBannerList();
        }, (err) => {
            this.isLoadingList = false;
            this.msg.error('删除轮播图失败，请重试!');
        })
    }

    editBanner(item: any) {
        this.isAddModal = false;
        this.handleAddOrEditBannerFormDataInit(item);
        this.handleShowAddOrEditBannerModal();
    }

    // 添加/修改 轮播图设置
    addOrEditBannerModalVisible: boolean = false;
    isAddModal = true;
    bannerFormData: any;
    typeList = [];
    isAddingOrEditingBanner: boolean = false;
    editBannerLabel: number = 0;
    bannerSchema: SFSchema = {
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
                    widget: 'cascader',
                } as SFCascaderWidgetSchema,
                default: [-10]
            },
            icon: {
                type: 'string',
                title: '轮播图',
                ui: {
                    widget: 'upload',
                    action: `${environment.SERVER_URL}/api${Interface.UploadImage}`,
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

    handleShowAddOrEditBannerModal() {
        if (this.isAddModal) {
            this.handleAddOrEditBannerFormDataInit();
        }
        this.addOrEditBannerModalVisible = true;
    }

    handleHideAddOrEditBannerModal() {
        this.isAddModal = true;
        this.handleAddOrEditBannerFormDataInit();
        this.addOrEditBannerModalVisible = false;
    }

    handleAddOrEditBannerFormDataInit(e: any = {}) {
        this.bannerSchema.properties.type.enum = [
            {value: -10, label: '其他', parent: 0},
            {
                value: -11, label: '商品列表', parent: 0, children: this.typeList.filter((w) => {
                    return w.parent == -11;
                })
            },
            {
                value: -12, label: '商品详情', parent: 0, children: this.typeList.filter((w) => {
                    return w.parent == -12;
                })
            },
        ];
        if (this.isAddModal) {
            this.bannerFormData = {
                title: '',
                rank: 0,
                type: [-10],
                status: false
            };
            this._uploadIconService.emptyIconList();
        } else {
            this.editBannerLabel = parseInt(e['id']);
            let type = e['type'];
            let linkurl = e['link'];
            let types = [];
            switch (type) {
                case 0:
                    types.push(-10);
                    break;
                case 1:
                    types.push(-11);
                    break;
                case 2:
                    types.push(-12);
                    break;
            }
            if (linkurl) {
                types.push(parseInt(linkurl.split('=')[1]))
            }
            this.bannerFormData = {
                title: e['title'],
                rank: e['sort'],
                type: types,
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
            this.bannerSchema.properties.icon.enum = icons;
        } else {
            this.bannerSchema.properties.icon.enum = null;
        }
    }

    disableCreateOrEditBannerSubmitButton(sf: SFComponent): boolean {
        return !sf.valid || this._uploadIconService.isUploding;
    }

    handleCreateOrEditBannerSubmit(value: any): void {
        let naviType = 0;
        let linkid = 0;
        if (value.type.length > 1) {
            if (value.type[0] == -11) {
                naviType = 1;
            }
            if (value.type[0] == -12) {
                naviType = 2;
            }
            linkid = value.type[1];
        }
        let bannerTemplate = {
            banner_id: this.isAddModal ? 0 : this.editBannerLabel,
            title: value.title,
            sort: value.rank,
            link_id: linkid,
            main_image: this._uploadIconService.iconList[0] ? this._uploadIconService.iconList[0] : '',
            status: value.status ? 1 : 0,
            type: naviType
        };
        this.isAddingOrEditingBanner = true;
        this._microAppHttpClient.post(Interface.AddOrEditCarouselEndPoint, bannerTemplate).subscribe((data) => {
            this.isAddingOrEditingBanner = false;
            this.msg.info(this.isAddModal ? '添加轮播图信息成功!' : '修改轮播图信息成功!');
            this.handleHideAddOrEditBannerModal();
            this.loadBannerList();
        }, (err) => {
            this.isAddingOrEditingBanner = false;
            this.msg.error(this.isAddModal ? '添加轮播图信息失败!' : '修改轮播图信息失败!');
        })
    }


}
