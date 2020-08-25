// @ts-ignore
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
// @ts-ignore
import {FormBuilder} from "@angular/forms";
// @ts-ignore
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
// @ts-ignore
import {STColumn, STData} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
// @ts-ignore
import {SFComponent, SFSchema} from "@delon/form";

// @ts-ignore
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'micro-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {

    constructor(
        private fb: FormBuilder,
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        private _microAppHttpClient: MicroAppService
    ) {
    }

    /**
     * 企业列表设置
     */
    isLoadingList = true;
    columnSetting: STColumn[] = [
        {
            title: 'ID', index: 'id', format: (item) => {
                return 'E' + item.id;
            }
        },
        {title: '企业名称', index: 'name'},
        {
            title: '操作', buttons: [
                {
                    text: '修改',
                    type: 'none',
                    click: (e: any) => {
                        this.isAddModal = false;
                        this.handleAddOrEditEnterpriseFormDataInit(e);
                        this.showAddOrEditEnterpriseModal();
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (e: any) => {
                        this.handleRemoveEnterprise(parseInt(e.id));
                    }
                },
            ]
        }
    ];
    enterpriseListData: STData[] = [];

    /**
     * 添加企业模态框
     */
    addOrEditEnterpriseModalVisible = false;
    isAddModal = true;

    enterpriseFormData: any;
    enterpriseSchema: SFSchema = {
        properties: {
            name: {
                type: 'string',
                title: '企业名称'
            }
        },
        required: ['name']
    };
    isAddingOrEditingEnterprise = false;
    editEnterpriseLabel = 0;

    ngOnInit() {
        this.loadEnterpriseList();
    }

    /**
     * 加载企业列表
     */
    loadEnterpriseList(): void {
        this.isLoadingList = true;
        this.enterpriseListData = [];
        this._microAppHttpClient.get(Interface.EnterpriseListEndPoint).subscribe((data) => {
           if(data) {
               this.enterpriseListData = data;
           }
           this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试!');
            this.isLoadingList = false;
        });
    }

    showAddOrEditEnterpriseModal(): void {
        if (this.isAddModal) {
            this.handleAddOrEditEnterpriseFormDataInit();
        }
        this.addOrEditEnterpriseModalVisible = true;
    }

    hideAddOrEditEnterpriseModal(): void {
        this.isAddModal = true;
        this.handleAddOrEditEnterpriseFormDataInit();
        this.addOrEditEnterpriseModalVisible = false;
    }

    handleAddOrEditEnterpriseFormDataInit(e: any = {}): void {
        if(this.isAddModal) {
            this.enterpriseFormData = {
              name: ''
            };
        } else {
            this.editEnterpriseLabel = parseInt(e.id);
            this.enterpriseFormData = {
                name: e.name
            }
        }
    }

    disableAddOrEditEnterpriseSubmitButton(sf: SFComponent): boolean {
        return !sf.valid;
    }

    handleAddOrEditEnterpriseSubmit(value: any): void {
        const enterpriseTemplate = {
            enterprise_id: this.isAddModal? 0:this.editEnterpriseLabel,
            name: value.name
        };
        this.isAddingOrEditingEnterprise = true;
        this._microAppHttpClient.post(Interface.EnterpriseAddOrEditEndPoint, enterpriseTemplate).subscribe((data) =>{
           this.isAddingOrEditingEnterprise = false;
           this.msg.info(this.isAddModal? '添加企业信息成功!' : '修改企业信息成功!');
           this.hideAddOrEditEnterpriseModal();
           this.loadEnterpriseList();
        }, (err) => {
            this.isAddingOrEditingEnterprise = false;
            this.msg.error(this.isAddModal? '添加企业信息失败!' : '修改企业信息失败!')
        });
    }

    handleRemoveEnterprise(label: number) {
        this.isLoadingList = true;
        const removeEnterpriseTemplate = {
            enterprise_id: label
        };
        this._microAppHttpClient.post(Interface.EnterpriseRemoveEndPoint, removeEnterpriseTemplate).subscribe((data) =>{
            this.msg.info('删除企业信息成功!');
            this.loadEnterpriseList();
        }, (err) => {
            this.msg.error('删除企业信息失败, 请重新删除!');
        });
    }
}
