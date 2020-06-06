import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STColumn} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFSchema} from "@delon/form";

@Component({
    selector: 'micro-recharge-reduction',
    templateUrl: './recharge-reduction.component.html',
    styleUrls: ['./recharge-reduction.component.less']
})
export class RechargeReductionComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
    ) {
    }

    ngOnInit() {
        this.isLoadingRechargeList();
    }

    // 加载充值优惠列表
    isLoadingList: boolean = false;
    rechargeList = [];
    rechargeColumnSetting: STColumn[] = [
        {
            title: '充值优惠ID', index: 'id', format: (item) => {
                return 'RR' + item.id;
            }
        },
        {title: '面额', index: 'face_value'},
        {title: '售价', index: 'price'},
        {
            title: '操作', buttons: [
                {
                    text: '修改',
                    type: 'none',
                    click: (record) => {
                        this.isAddModal = false;
                        this.handleAddOrEditRechargeFormDataInit(record);
                        this.showAddOrEditRechargeModal();
                    }
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (record) => {
                        this.handleRemoveRecharge(parseInt(record['id']));
                    }
                }
            ]
        }
    ];

    isLoadingRechargeList() {
        this.isLoadingList = true;
        this.rechargeList = [];
        this._microAppHttpClient.get(Interface.LoadRechargeReduceListEndPoint).subscribe((data) => {
            if (data) {
                this.rechargeList = data;
            }
            this.isLoadingList = false;
        }, (err) => {
            this.msg.error('请求失败, 请重试！');
            this.isLoadingList = false;
        })
    }

    // 添加/修改 充值优惠 计划
    addOrEditRechargeModalVisible: boolean = false;
    isAddModal = true;
    rechargeFormData: any;
    rechargeSchema: SFSchema = {
        properties: {
            face_value: {
                type: 'number',
                title: '面额'
            },
            price: {
                type: 'number',
                title: '售价'
            }
        },
        required: ['face_value', 'price']
    };
    isAddingOrEditingRecharge: boolean = false;
    editRechargeLabel: number = 0;

    showAddOrEditRechargeModal(): void {
        if (this.isAddModal) {
            this.handleAddOrEditRechargeFormDataInit();
        }
        this.addOrEditRechargeModalVisible = true;
    }

    handleCreateOrEditRechargeCancel(): void {
        this.isAddModal = true;
        this.handleAddOrEditRechargeFormDataInit();
        this.addOrEditRechargeModalVisible = false;
    }

    handleAddOrEditRechargeFormDataInit(e: any = {}): void {
        if (this.isAddModal) {
            this.rechargeFormData = {
                face_value: 0,
                price: 0
            }
        } else {
            this.editRechargeLabel = e['id'];
            this.rechargeFormData = {
                face_value: e['face_value'],
                price: e['price']
            }
        }
    }

    disableCreateOrEditRechargeSubmitButton(sf: SFComponent): boolean {
        return !sf.valid;
    }

    handleCreateOrEditRechargeSubmit(value: any): void {
        let rechargeTemplate = {
            recharge_id: this.isAddModal ? 0 : this.editRechargeLabel,
            face_value: value['face_value'],
            price: value['price']
        };
        this.isAddingOrEditingRecharge = true;
        this._microAppHttpClient.post(Interface.AddOrEditRechargeReduceEndPoint, rechargeTemplate).subscribe((data) => {
            this.isAddingOrEditingRecharge = false;
            this.msg.info(this.isAddModal ? '添加充值优惠信息成功!' : '修改充值优惠信息成功!');
            this.handleCreateOrEditRechargeCancel();
            this.isLoadingRechargeList();
        }, (err) => {
            this.isAddingOrEditingRecharge = false;
            this.msg.error(this.isAddModal ? '添加充值优惠信息失败!' : '修改充值优惠信息失败!');
        });

    }

    handleRemoveRecharge(label: number) {
        this.isLoadingList = true;
        let removeRechargeTemplate = {
            recharge_id: label
        };
        this._microAppHttpClient.post(Interface.DeleteRechargeReduceEndPoint, removeRechargeTemplate).subscribe((data) => {
            this.msg.info('删除充值优惠信息成功!');
            this.isLoadingRechargeList();
        }, (err) => {
            this.msg.error('删除充值优惠信息失败, 请重新删除!');
        })
    }

}
