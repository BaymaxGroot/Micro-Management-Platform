import {Component, OnInit} from '@angular/core';
import {STColumn, STColumnBadge, STData} from "@delon/abc";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";
import {SFComponent, SFRadioWidgetSchema, SFSchema} from "@delon/form";

const BADGE: STColumnBadge = {
    0: {text: '失效', color: 'default'},
    1: {text: '生效', color: 'success'},
};

const ROLEBADGE: STColumnBadge = {
    2: {text: '普通用户', color: 'default'},
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
                        this.editUserLabel = record.uid;
                        this.editUserRole = record.role;
                        this.isAddModal = false;
                        this.handleAddOrEditFormDataInit(record);
                        this.showAddOrEditUserModal();
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

    addOrEditUserModalVisble: boolean = false;
    isAddModal = true;

    showAddOrEditUserModal(): void {
        if(this.isAddModal) {
            this.handleAddOrEditFormDataInit();
        }
        this.addOrEditUserModalVisble = true;
    }

    hideAddOrEditUserModal() {
        this.isAddModal = true;
        this.handleAddOrEditFormDataInit();
        this.addOrEditUserModalVisble = false;
    }

    handleAddOrEditFormDataInit(e: any = {}) {
        if(this.isAddModal) {
            this.userFormData = {
                account: '',
                password: '',
                mobile: '',
                email: '',
                sex: 1
            };
        } else {
            this.userFormData = {
                account: e.account,
                password: '',
                mobile: e.mobile,
                email: e.email,
                sex: e.sex
            };
        }
    }

    userFormData: any;
    userSchema: SFSchema = {
      properties: {
          account: {
              type: 'string',
              title: '账号'
          },
          password: {
              type: 'string',
              title: '密码'
          },
          mobile: {
              type: 'string',
              title: '联系电话'
          },
          email: {
              type: 'string',
              title: '邮箱'
          },
          sex: {
              type: 'integer',
              title: '性别',
              enum: [
                    {label: '男', value: 1},
                    {label: '女', value: 0}
                ],
                ui: {
                    widget: 'radio'
                } as SFRadioWidgetSchema,
                default: 1
          }
      },
        required: ['account', 'password', 'mobile']
    };
    isAddingOrEditingUser: boolean = false;
    editUserLabel: number = 0;
    editUserRole: number = 0;

    disableAddOrEditUserSubmitButton(sf: SFComponent): boolean {
        return !sf.valid;
    }

    handleAddOrEditUserSubmit(value: any):void {
        let userTemplate = {
            uid: this.isAddModal? 0:this.editUserLabel,
            uaccount: value.account,
            upassword: value.password,
            umobile: value.mobile,
            uemail: value.email,
            usex: value.sex,
            ustatus: 1,
            urole: this.editUserRole
        };
        this.isAddingOrEditingUser = true;
        this._microAppHttpClient.post(Interface.AddOrEditUserEndPoint, userTemplate).subscribe((data) => {
            this.isAddingOrEditingUser = false;
            this.msg.info(this.isAddModal? '添加用户成功!': '修改用户信息成功!');
            this.hideAddOrEditUserModal();
            this.loadUserList();
        }, (err) => {
            this.isAddingOrEditingUser = false;
            this.msg.error(this.isAddModal? '添加用户失败!':'修改用户恓失败!');
        })
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
