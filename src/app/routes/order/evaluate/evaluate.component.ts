import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STColumn, STColumnTag} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";

const TAG: STColumnTag = {
    0: {text: '隐藏', color: ''},
    1: {text: '显示', color: 'green'},
};

@Component({
    selector: 'micro-evaluate',
    templateUrl: './evaluate.component.html',
    styleUrls: ['./evaluate.component.less']
})
export class EvaluateComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
    ) {
    }

    ngOnInit() {
        this.loadEvaluateList();
    }

    isLoadingList: boolean = false;
    evaluateList = [];
    evaluateColumnSetting: STColumn[] = [
        {
            title: '操作', buttons: [
                {
                    text: (record) => {
                        return record.status == 1 ? '隐藏' : '显示';
                    }, type: 'none', click: ((record) => {
                      this.handleChangeEvaluateStatus(parseInt(record['shop_id']), record['status'] == 0);
                    })
                },
                {
                    text: '删除',
                    type: 'del',
                    click: (record) => {
                        this.handleRemoveEvaluate(parseInt(record['shop_id']));
                    }
                }
            ]
        }
    ];

    loadEvaluateList() {
        this.isLoadingList = true;
        this.evaluateList = [];
        this._microAppHttpClient.get(Interface.LoadEvaluateListEndPoint).subscribe((data) => {
            if(data) {
                this.evaluateList = data;
            }
            this.isLoadingList = false;
        }, (err) => {
           this.msg.error('加载评论列表失败!');
           this.isLoadingList = false;
        });
    }

    handleChangeEvaluateStatus(e_id: number, status: boolean) {
        let changeEvaluateStatusTemplate = {
            shop_id: e_id,
            status: status? 1:0
        };
        this.isLoadingList = true;
        this._microAppHttpClient.post(Interface.ChangeEvaluateStatusEndPoint, changeEvaluateStatusTemplate).subscribe((data) => {
           this.msg.info(`${status ? '显示' : '隐藏'}评论成功!`);
            this.loadEvaluateList();
        }, (err) => {
            this.msg.error(`${status ? '显示' : '隐藏'}评论失败, 请重新操作!`);
        });
    }

    handleRemoveEvaluate(label: number) {
        this.isLoadingList = true;
        let removeEvaluateTemplate = {
            shop_id: label
        };
        this._microAppHttpClient.post(Interface.DeleteEvaluateEndPoint, removeEvaluateTemplate).subscribe((data) => {
            this.msg.info('删除评论成功!');
            this.loadEvaluateList();
        }, (err) => {
            this.msg.error('删除评论失败, 请重新删除!');
        })
    }
}
