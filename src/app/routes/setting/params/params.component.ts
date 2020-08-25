import {Component, OnInit} from '@angular/core';
import {MicroAppService} from "@core/net/micro-app.service";
import {NzMessageService} from "ng-zorro-antd";
import {SFComponent, SFSchema} from "@delon/form";
import {Interface} from "../../../lib/enums/interface.enum";

@Component({
    selector: 'micro-params',
    templateUrl: './params.component.html',
    styleUrls: ['./params.component.less']
})
export class ParamsComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService
    ) {
    }

    isLoading = false;

    isSettingParams = false;
    formData: any;
    settingSchema: SFSchema = {
        properties: {
            min_price: {
                type: 'number',
                title: '订单金额',
                ui: {
                    optionalHelp: '订单金额超过此值，免运费'
                }
            },
            yunfei: {
                type: 'number',
                title: '运费'
            },
            refund_hour: {
                type: 'integer',
                title: '时间',
                ui: {
                    optionalHelp: '超过此时间不自动退款',
                    unit: '小时'
                }
            }
        },
        required: ['min_price', 'yunfei', 'refund_hour']
    };

    ngOnInit() {
        this.loadSettingParams();
    }
    loadSettingParams() {
        this.isLoading = true;
        this._microAppHttpClient.get(Interface.GetParamsEndPoint).subscribe((data) => {
            this.formData = data;
            this.isLoading = false;
        }, (err) => {
            this.msg.error('获取配置参数出错!');
        })
    }

    disableChangeSettingParamsSubmitButton(sf: SFComponent) {
        return !sf.valid;
    }

    handleSubmit(e: any) {
        const changeSettingTemplate = {
            yunfei: e.yunfei,
            refund_hour: e.refund_hour,
            min_price: e.min_price
        };
        this.isSettingParams = true;
        this._microAppHttpClient.post(Interface.SettingParamsEndPoint, changeSettingTemplate).subscribe((data) => {
            this.isSettingParams = false;
            this.msg.info('设置更新成功!');
            this.loadSettingParams();
        }, (err) => {
            this.isSettingParams = false;
            this.msg.info('设置更新失败!');
        });
    }

}
