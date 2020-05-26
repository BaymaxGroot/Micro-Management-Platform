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
    }

    /**
     * 加载企业购买记录
     */
    isLoadingEnterpriseRechargeLog: boolean = true;
    enterpriseRechargeLog: [] = [];
    enterpriseList: [] = [];
    rechargeLog: [] = [];

    loadEnterpriseRechargeLog(): void {
        this.isLoadingEnterpriseRechargeLog = true;
        this.enterpriseRechargeLog = [];
        this.enterpriseList = [];
        this.rechargeLog = [];
        this._microAppHttpClient.get(Interface.EnterpriseRechargeLogEndPoint).subscribe((data) => {
            if(data) {
                this.enterpriseRechargeLog = data;
                this.generateEnterpriseAndRechargeLogSelectList();
            }
            this.isLoadingEnterpriseRechargeLog = false;
        }, (err) => {
            this.msg.error('加载企业购买记录失败, 请重试!');
            this.isLoadingEnterpriseRechargeLog = false;
        })
    }

    generateEnterpriseAndRechargeLogSelectList() {

    }

    /**
     * 充值列表设置
     */
    isLoadingList: boolean = true;
    selectedRechargeLogId: number;
    columnSetting: STColumn[] = [];
    rechargeListData: STData[] = [];

    /**
     * 加载充值列表
     */
    loadRechargeList(): void {
        this.isLoadingList = true;
        this.rechargeListData = [];
        this._microAppHttpClient.get(Interface.EnterpriseRechargeListEndPoint).subscribe((data)=>{
            if(data) {
                this.rechargeListData = data;
            }
            this.isLoadingList = false;
        }, (err) =>{
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
