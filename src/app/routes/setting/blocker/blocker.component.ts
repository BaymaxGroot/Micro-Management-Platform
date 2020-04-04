import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {UploadIconService} from "@shared/service/upload-icon.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {environment} from "@env/environment";
import {SFCascaderWidgetSchema, SFComponent, SFSchema, SFUploadWidgetSchema} from "@delon/form";

@Component({
    selector: 'micro-blocker',
    templateUrl: './blocker.component.html',
    styleUrls: ['./blocker.component.less']
})
export class BlockerComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
        private _uploadIconService: UploadIconService
    ) {
        this._uploadIconService.maxUploadLimit = 1;
        this._uploadIconService.minUploadLimit = 1;
    }

    ngOnInit() {
        this.loadBlockerList();
    }

    isLoadingList: boolean = false;
    blockerList = [];

    loadBlockerList() {
        this.isLoadingList = true;
        this._microAppHttpClient.get(Interface.LoadBlockerListEndPoint).subscribe((data) => {
            if (data) {
                this.blockerList = data;
                this.blockerList.forEach((item) => {
                    item['cover'] = environment.SERVER_URL + '/static/upload/' + item['main_image'];
                });
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('加载图片魔方列表失败!');
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
            case 1:
                return '商品列表';
            case 2:
                return '商品详情';
        }
    }

    deleteBlocker(id: number) {
        let deleteBlockerTemplate = {
            cube_id: id
        };
        this.isLoadingList = true;
        this._microAppHttpClient.post(Interface.DeleteBlockerEndPoint, deleteBlockerTemplate).subscribe((data) => {
            this.msg.info('删除图片魔方成功!');
            this.loadBlockerList();
        }, (err) => {
            this.isLoadingList = false;
            this.msg.error('删除图片魔方失败，请重试!');
        })
    }

    editBlocker(item: any) {
        this.isAddModal = false;
        this.handleAddOrEditBlockerFormDataInit(item);
        this.handleShowAddOrEditBlockerModal();
    }

    // 添加/修改 轮播图设置
    addOrEditBlockerModalVisible: boolean = false;
    isAddModal = true;
    blockerFormData: any;
    typeList = [];
    isAddingOrEditingBlocker: boolean = false;
    editBlockerLabel: number = 0;
    blockerSchema: SFSchema = {
        properties: {
            title: {
                type: 'string',
                title: '版块名称'
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
                } as SFCascaderWidgetSchema
            },
            icon: {
                type: 'string',
                title: '版块图片',
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
            }
        },
        required: ['title', 'rank', 'type', 'icon']
    };

    handleShowAddOrEditBlockerModal() {
        if (this.isAddModal) {
            this.handleAddOrEditBlockerFormDataInit();
        }
        this.addOrEditBlockerModalVisible = true;
    }

    handleHideAddOrEditBlockerModal() {
        this.isAddModal = true;
        this.handleAddOrEditBlockerFormDataInit();
        this.addOrEditBlockerModalVisible = false;
    }

    handleAddOrEditBlockerFormDataInit(e: any = {}) {
        this.blockerSchema.properties.type.enum = [
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
            this.blockerFormData = {
                title: '',
                rank: 0,
                type: [-12]
            };
            this._uploadIconService.emptyIconList();
        } else {
            this.editBlockerLabel = parseInt(e['id']);
            let type = e['type'];
            let linkurl = e['link'];
            let types = [];
            switch (type) {
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
            this.blockerFormData = {
                title: e['title'],
                rank: e['sort'],
                type: types
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
            this.blockerSchema.properties.icon.enum = icons;
        } else {
            this.blockerSchema.properties.icon.enum = null;
        }
    }

    disableCreateOrEditBlockerSubmitButton(sf: SFComponent): boolean {
        return !sf.valid || this._uploadIconService.isUploding || this._uploadIconService.iconList.length < this._uploadIconService.minUploadLimit;
    }

    handleCreateOrEditBlockerSubmit(value: any): void {
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
        let blockerTemplate = {
            cube_id: this.isAddModal ? 0 : this.editBlockerLabel,
            title: value.title,
            sort: value.rank,
            link_id: linkid,
            main_image: this._uploadIconService.iconList[0] ? this._uploadIconService.iconList[0] : '',
            type: naviType
        };
        this.isAddingOrEditingBlocker = true;
        this._microAppHttpClient.post(Interface.AddOrEditBlockerEndPoint, blockerTemplate).subscribe((data) => {
            this.isAddingOrEditingBlocker = false;
            this.msg.info(this.isAddModal ? '添加图片魔方信息成功!' : '修改图片魔方信息成功!');
            this.handleHideAddOrEditBlockerModal();
            this.loadBlockerList();
        }, (err) => {
            this.isAddingOrEditingBlocker = false;
            this.msg.error(this.isAddModal ? '添加图片魔方信息失败!' : '修改图片魔方信息失败!');
        })
    }

}
