import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STColumn, STData} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFSchema} from "@delon/form";

@Component({
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

    ngOnInit() {
        this.loadEnterpriseList();
    }

    /**
     * 企业列表设置
     */
    isLoadingList = true;
    columnSetting: STColumn[] = [
        {
            title: 'ID', index: 'id', format: (item) => {
                return 'E' + item['id'];
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
                    text: '充值记录',
                    type: 'none',
                    click: (e: any) => {
                        this.showBuyRecordModal(e);
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (e: any) => {
                        this.handleRemoveEnterprise(parseInt(e['id']));
                    }
                },
            ]
        }
    ];
    enterpriseListData: STData[] = [];

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

    /**
     * 添加企业模态框
     */
    addOrEditEnterpriseModalVisible: boolean = false;
    isAddModal: boolean = true;

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
            this.editEnterpriseLabel = parseInt(e['id']);
            this.enterpriseFormData = {
                name: e['name']
            }
        }
    }

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
    isAddingOrEditingEnterprise: boolean = false;
    editEnterpriseLabel: number = 0;

    disableAddOrEditEnterpriseSubmitButton(sf: SFComponent): boolean {
        return !sf.valid;
    }

    handleAddOrEditEnterpriseSubmit(value: any): void {
        let enterpriseTemplate = {
            enterprise_id: this.isAddModal? 0:this.editEnterpriseLabel,
            name: value['name']
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
        let removeEnterpriseTemplate = {
            enterprise_id: label
        };
        this._microAppHttpClient.post(Interface.EnterpriseRemoveEndPoint, removeEnterpriseTemplate).subscribe((data) =>{
            this.msg.info('删除企业信息成功!');
            this.loadEnterpriseList();
        }, (err) => {
            this.msg.error('删除企业信息失败, 请重新删除!');
        });
    }

    buyRecordModalVisible: boolean = false;
    enterpriseBuyRecordLabel: number;
    enterpriseBuyRecordName: string;
    isLoadingBuyRecordList: boolean = false;
    buyRecordColumnSetting: STColumn[] = [
        {title: '优惠券面值', index: 'avg_amount'},
        {title: '数量', index: 'count'},
        {title: '备注', index: 'note'},
        {title: '充值日期', index: 'recharge_time', type: 'date'}
    ];
    buyRecordListData: STData[] = [];

    showBuyRecordModal(e: any): void {
        this.enterpriseBuyRecordLabel = parseInt(e['id']);
        this.enterpriseBuyRecordName = e['name'];
        this.buyRecordModalVisible = true;
        this.loadBuyRecordList();
    }

    hideBuyRecordModal(): void {
        this.buyRecordModalVisible = false;
    }

    loadBuyRecordList(): void {
        this.isLoadingBuyRecordList = true;
        this.buyRecordListData = [];
        this._microAppHttpClient.get(`${Interface.EnterpriseBuyRecordEndPoint}?id=${this.enterpriseBuyRecordLabel}`).subscribe((data) =>{
           if(data) {
               this.buyRecordListData = data;
           }
           this.isLoadingBuyRecordList = false;
        }, (err) => {
            this.msg.error('请求失败， 请重试!');
            this.isLoadingBuyRecordList = false;
            this.hideBuyRecordModal();
        });
    }
}
