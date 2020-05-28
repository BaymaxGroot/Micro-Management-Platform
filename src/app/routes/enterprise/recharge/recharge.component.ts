import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STColumn, STData} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFSchema} from "@delon/form";


@Component({
    selector: 'micro-recharge',
    templateUrl: './recharge.component.html',
    styleUrls: ['./recharge.component.less']
})
export class RechargeComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        private _microAppHttpClient: MicroAppService
    ) {
    }

    ngOnInit() {
        this.loadEnterpriseRechargeLog();
    }

    /**
     * 加载企业购买记录
     */
    isLoadingEnterpriseRechargeLog: boolean = true;
    enterpriseRechargeLog: any;
    enterpriseList: any;
    enterpriseSelectedLabel: string = '';
    rechargeLogSelectedLabel: string = '';
    rechargeLog: any[] = [];
    Object = Object.keys;

    loadEnterpriseRechargeLog(): void {
        this.isLoadingEnterpriseRechargeLog = true;
        this.enterpriseRechargeLog = {};
        this.enterpriseList = {};
        this.rechargeLog = [];
        this._microAppHttpClient.get(Interface.EnterpriseRechargeLogEndPoint).subscribe((data) => {
            if (data) {
                this.enterpriseRechargeLog = data;
                this.generateEnterpriseSelectList();
            }
            this.isLoadingEnterpriseRechargeLog = false;
        }, (err) => {
            this.msg.error('加载企业购买记录失败, 请重试!');
            this.isLoadingEnterpriseRechargeLog = false;
        })
    }

    generateEnterpriseSelectList() {
        Object.keys(this.enterpriseRechargeLog).forEach((item) => {

            this.enterpriseRechargeLog[item].forEach((log) => {

                this.enterpriseList[item] = log['enterprise_name'];

            });

        });
        if(this.enterpriseSelectedLabel === '') {
            this.enterpriseSelectedLabel = Object.keys(this.enterpriseRechargeLog).length > 0 ? Object.keys(this.enterpriseRechargeLog)[0] : '';
        }
        this.generateRechargeLogSelectList();
    }

    generateRechargeLogSelectList() {
        this.rechargeLog = [];
        this.rechargeLogSelectedLabel = '';
        if (this.enterpriseSelectedLabel !== '') {
            this.enterpriseRechargeLog[this.enterpriseSelectedLabel].forEach((item) => {
                this.rechargeLog.push({
                    label: item['datetime'] + ' - ' + item['count'] + ' - ' + item['price'],
                    value: item['log_id']
                });
            });
            if( this.rechargeLogSelectedLabel === '' ) {
                this.rechargeLogSelectedLabel = this.rechargeLog[0]['value'];
            }
        }
        this.loadRechargeList();
    }

    /**
     * 充值列表设置
     */
    isLoadingList: boolean = false;
    columnSetting: STColumn[] = [
        {title: '姓名', index: 'employee_name'},
        {title: '充值手机号', index: 'phone_number'},
        {
            title: '状态', index: 'status', type: 'badge', badge: {
                0: {text: '未激活', color: 'default'},
                1: {text: '未领取', color: 'processing'},
                2: {text: '已领取', color: 'success'}
            }
        }
    ];
    rechargeListData: STData[] = [];

    /**
     * 加载充值列表
     */
    loadRechargeList(): void {
        if (this.rechargeLogSelectedLabel === '') {
            return;
        }
        this.isLoadingList = true;
        this.rechargeListData = [];
        this._microAppHttpClient.get(`${Interface.EnterpriseRechargeListEndPoint}?id=${Number(this.rechargeLogSelectedLabel)}`).subscribe((data) => {
            if (data) {
                this.rechargeListData = data;
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败，请重试!');
            this.isLoadingList = false;
        })
    }

    /**
     * 批量导入
     */
    isBatchUploadModalVisible: boolean = false;
    isBatchUploading: boolean = false;
    batchUploadFormData: any;
    batchUploadSchema: SFSchema = {
        properties: {
            enterprise: {
                title: '企业名称',
                type: 'number'
            },
            value: {
                title: '面额',
                type: 'number'
            },
            nums: {
                title: '数量',
                type: 'integer'
            }
        },
        required: ['enterprise', 'value', 'nums']
    };

    showBatchUploadModal(): void {
        this.isBatchUploadModalVisible = true;
    }

    hideBatchUploadModal(): void {
        this.isBatchUploadModalVisible = false;
    }

    handleBatchUploadSubmitEvent(): void {

    }

    /**
     * 批量充值
     */
    handleBatchRecharge(): void {

    }

}
