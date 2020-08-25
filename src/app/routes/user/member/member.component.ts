import {Component, OnInit} from '@angular/core';
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STColumn, STColumnBadge} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";

const SEX: STColumnBadge = {
    0: {text: '女', color: 'error'},
    1: {text: '男', color: 'success'},
};

@Component({
    selector: 'micro-member',
    templateUrl: './member.component.html',
    styleUrls: ['./member.component.less']
})
export class MemberComponent implements OnInit {

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService
    ) {
    }

    /**
     * 用户列表
     */
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'member_id', format: (item) => {
                return 'V' + item.member_id;
            }
        },
        {
            title: '昵称', index: 'name'
        },
        {
            title: '头像', index: 'avatar', type: 'img'
        },
        {
            title: '电话', index: 'phone'
        },
        {title: '性别', index: 'sex', type: 'badge', badge: SEX},
        {title: '账户余额', index: 'recharge'},
        {
            title: '操作', buttons: [
                {
                    text: '查看账户明细', click: (record, modal, instance) => {
                        this.showAccountDetailModal(record);
                    }
                }
            ]
        }

    ];

    isLoading = false;
    userList = [];

    isAccountDetailModalVisible = false;
    isLoadingAccountDetail = true;
    accountDetails: any[];

    ngOnInit() {
        this.loadUserList();
    }

    loadUserList() {
        this.isLoading = true;
        this._microAppHttpClient.get(Interface.LoadVIPListEndPoint).subscribe((data) => {
            this.userList = data;
            this.isLoading = false;
        }, (err) => {
            this.msg.error('加载用户列表失败!');
        });
    }

    showAccountDetailModal(e: any): void {
        this.isAccountDetailModalVisible = true;
        this.generateAccountDetail(e);
    }

    hideAccountDetailModal(): void {
        this.isAccountDetailModalVisible = false;
    }

    generateAccountDetail(e: any): void {
        this.isLoadingAccountDetail = true;
        this.accountDetails = [];
        this._microAppHttpClient.get(`${Interface.GenerateAccountDetailEndPoint}?id=${Number(e.member_id)}`).subscribe((data) => {
            if (data) {
                this.accountDetails = data;
            }
            this.isLoadingAccountDetail = false;
        }, (err) => {
            this.isLoadingAccountDetail = false;
            this.msg.error('加载账户明细失败, 请重试!');
            this.hideAccountDetailModal();
        })
    }
}
