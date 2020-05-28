import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {NzMessageService, UploadFile} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STChange, STColumn, STData, XlsxService} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
import {XlsxModule} from '@delon/abc/xlsx';


@Component({
    selector: 'micro-recharge',
    templateUrl: './recharge.component.html',
    styleUrls: ['./recharge.component.less']
})
export class RechargeComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private cdr: ChangeDetectorRef,
        private xlsx: XlsxService,
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
        if (this.enterpriseSelectedLabel === '') {
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
            if (this.rechargeLogSelectedLabel === '') {
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
        {title: '编号', index: 'check', type: 'checkbox'},
        {title: '姓名', index: 'employee_name'},
        {title: '充值手机号', index: 'phone_number'},
        {
            title: '状态', index: 'status', type: 'badge', badge: {
                0: {text: '未激活', color: 'default'},
                1: {text: '未领取', color: 'processing'},
                2: {text: '已领取', color: 'success'}
            }, filter: {
                menus: [
                    {text: '未激活', value: 0},
                    {text: '未领取', value: 1},
                    {text: '已领取', value: 2}
                ],
                fn: (filter, record) => {
                    return record.status == filter.value;
                }
            }
        },
        {
            title: '操作', buttons: [
                {
                    text: '充值', type: 'none', click: (record, modal, instance) => {
                        this.handleBatchRecharge([parseInt(record.employee_id)]);
                    },
                    iif: (item) => {
                        return item.status == 0;
                    }
                }
            ]
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
                this.rechargeListData.forEach( (item) => {
                    item['check'] = 0;
                } )
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败，请重试!');
            this.isLoadingList = false;
        })
    }

    /**
     * 加载企业名单
     */
    isLoadingEnterpriseList: boolean = false;
    batchRechargeEnterpriseArray: any[];
    batchRechargeSelectedEnterpriseLabel: number;
    batchRechargeValue: number;
    batchRechargeCount: number;

    loadEnterpriseArray(): void {
        this.isLoadingEnterpriseList = true;
        this._microAppHttpClient.get(Interface.EnterpriseListEndPoint).subscribe((data) => {
            if (data) {
                this.batchRechargeEnterpriseArray = data;
            }
            this.isLoadingEnterpriseList = false;
            if (this.batchRechargeEnterpriseArray.length == 0) {
                this.msg.info('请先录入企业!');
                this.hideBatchUploadModal();
            } else {
                this.batchRechargeSelectedEnterpriseLabel = this.batchRechargeEnterpriseArray[0]['id'];
            }
        }, (err) => {
            this.isLoadingEnterpriseList = false;
            this.msg.error('加载企业列表失败!');
            this.hideBatchUploadModal();
        });
    }

    /**
     * 上传Excel
     */
    excelData: any;

    handleUploadExcel(e: Event): void {
        const node = e.target as HTMLInputElement;
        let fileDir: any = node.files![0].name;
        let suffix = fileDir.substring(fileDir.lastIndexOf("."));

        if ("" == fileDir) {
            this.msg.info("选择需要导入的Excel文件！");
            node.value = '';
            return;
        }
        if (".xls" != suffix && ".xlsx" != suffix) {
            this.msg.info("选择Excel格式的文件导入！");
            node.value = '';
            return;
        }

        this.xlsx.import(node.files![0]).then(res => this.excelData = res);
    }

    /**
     * 批量导入
     */
    isBatchUploadModalVisible: boolean = false;
    isBatchUploading: boolean = false;

    showBatchUploadModal(): void {
        this.isBatchUploadModalVisible = true;
        this.loadEnterpriseArray();
    }

    hideBatchUploadModal(): void {
        this.isBatchUploadModalVisible = false;
    }

    disableSubmitButton(): boolean {

        if (!this.excelData) {
            return true;
        }

        return this.batchRechargeValue == null || this.batchRechargeCount == null || this.batchRechargeCount <= 0 || !this.excelData;
    }

    handleBatchUploadSubmitEvent(): void {

        let excelLength = 0;
        Object.keys(this.excelData).forEach((pa) => {
            let res = this.excelData[pa];
            res = res.filter( (s) => {
                return s != [];
            } );
            excelLength = res.length;
        });

       if( this.batchRechargeCount != excelLength - 1 ) {
           this.msg.error('员工数量与输入不匹配!');
           return;
       }

        let employeeList = [];
        Object.keys(this.excelData).forEach((pa) => {
            let res = this.excelData[pa];
            let title = res.shift();
            res.forEach((item) => {
                employeeList.push({
                    name: item[1],
                    phone: item[2]
                });
            });
        });

        let batchUploadTemplate = {
            enterprise_id: this.batchRechargeSelectedEnterpriseLabel,
            value: this.batchRechargeValue,
            count: this.batchRechargeCount,
            list: employeeList
        };

        this.isBatchUploading = true;
        this._microAppHttpClient.post(Interface.EnterpriseRechargeUploadEndPoint, batchUploadTemplate).subscribe((data) => {
            this.isBatchUploading = false;
            this.msg.info('批量录入成功!');
            this.hideBatchUploadModal();
            this.loadEnterpriseRechargeLog();
        }, (err) => {
            this.isBatchUploading = false;
            this.msg.error('批量录入失败, 请重试');
        });
    }

    /**
     * 批量充值
     */
    checkboxSelectedList: STData[] = [];
    isBatchRecharging: boolean = false;
    handleBatchRecharge(value: any): void {

        this.isBatchRecharging = true;
        let batchRechargingTemplate = {
            log_id: Number(this.rechargeLogSelectedLabel),
            employee_ids: value.join(','),
            amount: 1,
            note: ''
        };

        this._microAppHttpClient.post(Interface.EnterpriseBatchRechargingEndPint, batchRechargingTemplate).subscribe((data) =>{
            this.msg.info('充值成功!');
            this.loadRechargeList();
        }, (error) => {
           this.msg.error('充值失败, 请重试!');
           this.isBatchRecharging = false;
        });

    }

    /**
     * 响应人员选择框
     * @param e
     */
    handleCheckBoxSelected(e: STChange) {
        if (e.type == 'checkbox') {
            this.checkboxSelectedList = e.checkbox;
        }
    }

    /**
     * 得到Checkbox 选中的 用户id List
     */
    getCheckBoxSelectedIDList(): number[] {
        let pids: number[] = [];
        this.checkboxSelectedList.forEach((item) => {
            pids.push(parseInt(item['employee_id']));
        });
        return pids;
    }

}
