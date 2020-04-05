import {Component, OnInit} from '@angular/core';
import {STColumn, STColumnBadge, STData} from "@delon/abc";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";

const BADGE: STColumnBadge = {
    0: {text: '失效', color: 'default'},
    1: {text: '生效', color: 'success'},
};

const ROLEBADGE: STColumnBadge = {
    0: {text: '普通用户', color: 'default'},
    1: {text: '管理员', color: 'success'},
};

@Component({
    selector: 'micro-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {

    dateFormat = 'yyyy/MM/dd';

    constructor(
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService,
    ) {
    }

    ngOnInit() {
        this.loadUserList();
    }

    /**
     * 用户列表
     */
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'uid', format: (item) => {
                return 'U' + item['uid'];
            }
        },
        {
            title: '基本信息', index: 'mobile', format: (item, col, index) => {
                let nike = item.account;
                let phone = item.mobile == '' ? '暂无' : item.mobile;
                let name = item.email == '' ? '暂无' : item.email;
                return nike + '<br/>' + '电话: ' + phone + '<br/>' + '邮箱: ' + name;
            }
        },
        {title: '状态', index: 'status', type: 'badge', badge: BADGE},
        {title: '角色', index: 'role', type: 'badge', badge: ROLEBADGE},
        {
            title: '操作', buttons: [
                {
                    text: '编辑', click: (record, modal, instance) => {
                    }
                },
                {
                    text: '删除', type: 'del', click: (e) => {
                        this.deleteUser(parseInt(e['uid']));
                    }
                }
            ]
        }

    ];

    isLoading: boolean = false;
    userList = [];
    loadUserList() {
        this.isLoading = true;
        this._microAppHttpClient.get(Interface.LoadUserEndPoint).subscribe((data) => {
           this.userList = data;
           this.isLoading = false;
        }, (err) => {
            this.msg.error('加载用户列表失败!');
        });
    }

    deleteUser(uid: number) {
        let userTemplate = {
            uid: uid
        };
        this._microAppHttpClient.post(Interface.DeleteUserEndPoint, userTemplate).subscribe((data) => {
           this.msg.info('删除用户成功!');
           this.loadUserList();
        }, (err) => {
            this.msg.error('删除用户失败!');
        });
    }


}
