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

    ngOnInit() {
    }

    isSettingParams: boolean = false;
    settingSchema: SFSchema = {
        properties: {
            cost: {
                type: 'number',
                title: '订单金额',
                ui: {
                    optionalHelp: '订单金额超过此值，免运费'
                }
            },
            deliver: {
                type: 'number',
                title: '运费'
            },
            timer: {
                type: 'integer',
                title: '时间',
                ui: {
                    optionalHelp: '超过此时间自动退款',
                    unit: '小时'
                }
            }
        },
        required: ['cost', 'deliver', 'timer']
    };

    disableChangeSettingParamsSubmitButton(sf: SFComponent) {
        return !sf.valid;
    }

    handleSubmit(value: any) {
        let changeSettingTemplate = {};
        this.isSettingParams = true;
        this._microAppHttpClient.post(Interface.SettingParamsEndPoint, changeSettingTemplate).subscribe((data) => {
            this.isSettingParams = false;
            this.msg.info('设置更新成功!');
        }, (err) => {
            this.isSettingParams = false;
            this.msg.info('设置更新失败!');
        });
    }

}
