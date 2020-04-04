import {Component, OnInit} from '@angular/core';
import {STColumn, STData} from "@delon/abc";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";

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
    }

    /**
     * 用户列表
     */
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'id', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || String(record.id).indexOf(filter.value) !== -1;
                }
            }
        },
        {title: '头像', index: 'icon', type: 'img'},
        {
            title: '基本信息', index: 'info', format: (item, col, index) => {
                let nike = item.info.nick;
                let phone = item.info.phone == '' ? '暂无' : item.info.phone;
                let name = item.info.name == '' ? '暂无' : item.info.name;
                return nike + '<br/>' + '手机: ' + phone + '<br/>' + '姓名: ' + name;
            }, filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    let nike = record.info.nick;
                    let phone = record.info.phone == '' ? '暂无' : record.info.phone;
                    let name = record.info.name == '' ? '暂无' : record.info.name;
                    return !filter.value || nike.indexOf(filter.value) !== -1 ||
                        phone.indexOf(filter.value) !== -1 || name.indexOf(filter.value) !== -1;
                }
            }
        },
        {title: '加入时间', index: 'time', type: "date"},
        {title: '资产', index: 'capital'},
        {
            title: '数据统计', index: 'analytic', format: (item, col, index) => {
                let order = item.analytic.order;
                let su = item.analytic.sum;
                return '订单数: ' + order + '<br/>' + '订单金额: ' + su;
            }
        },
        {
            title: '操作', buttons: [
                {
                    text: '编辑', click: (record, modal, instance) => {
                    }
                }
            ]
        }

    ];
    /**
     * 用户列表 mock数据
     */
    mockData: STData[] = [
        {
            'id': 12345,
            'icon': 'http://img5.imgtn.bdimg.com/it/u=1522146444,3890939769&fm=11&gp=0.jpg',
            'info': {
                'nick': '小月',
                'phone': '12345678911',
                'name': ''
            },
            'time': '2020-03-04 08:56',
            'capital': 0,
            'analytic': {
                'order': 0,
                'sum': 0
            }
        },
        {
            'id': 6876876,
            'icon': 'http://b-ssl.duitang.com/uploads/item/201802/20/20180220165946_RiGPS.thumb.700_0.jpeg',
            'info': {
                'nick': '我是昵称',
                'phone': '',
                'name': '黎明'
            },
            'time': '2020-03-04 08:56',
            'capital': 0,
            'analytic': {
                'order': 0,
                'sum': 0
            }
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
