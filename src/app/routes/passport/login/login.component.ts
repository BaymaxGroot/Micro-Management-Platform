import {SettingsService} from '@delon/theme';
import {Component, OnDestroy, Inject, Optional} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {ITokenService, DA_SERVICE_TOKEN} from '@delon/auth';
import {ReuseTabService} from '@delon/abc';
import {StartupService} from '@core';
import {MicroAppService} from "@core/net/micro-app.service";
import {Interface} from "../../../lib/enums/interface.enum";

@Component({
    selector: 'passport-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less'],
    providers: [],
})
export class UserLoginComponent implements OnDestroy {

    constructor(
        fb: FormBuilder,
        modalSrv: NzModalService,
        private router: Router,
        private settingsService: SettingsService,
        @Optional()
        @Inject(ReuseTabService)
        private reuseTabService: ReuseTabService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
        private startupSrv: StartupService,
        public microAppHttpClient: MicroAppService,
        public msg: NzMessageService,
    ) {
        this.form = fb.group({
            userName: [null, [Validators.required]],
            password: [null, Validators.required]
        });
        modalSrv.closeAll();
    }

    // #region fields

    get userName() {
        return this.form.controls.userName;
    }

    get password() {
        return this.form.controls.password;
    }

    form: FormGroup;
    error = '';
    loginLoading = false;
    // #endregion

    submit() {
        this.loginLoading = true;
        this.error = '';
        this.userName.markAsDirty();
        this.userName.updateValueAndValidity();
        this.password.markAsDirty();
        this.password.updateValueAndValidity();
        if (this.userName.invalid || this.password.invalid) {
            return;
        }

        // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
        // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
        /**
         * 进行登陆操作
         */
        this.microAppHttpClient
            .post(`${Interface.LoginEndPoint}`, {
                uaccount: this.userName.value,
                upassword: this.password.value
            })
            .subscribe((res: any) => {
                this.loginLoading = false;
                // 清空路由复用信息
                this.reuseTabService.clear();
                // 设置用户信息
                this.settingsService.setUser({
                    name: res.user,
                    avatar: './assets/images/avatar.jpg'
                });
                // 设置用户Token信息
                this.tokenService.set({
                    token: window.btoa(JSON.stringify({
                        token: res.token,
                        user: res.user,
                        validTime: (new Date().getTime())
                    }))
                });
                // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
                this.startupSrv.load().then(() => {
                    let url = this.tokenService.referrer!.url || '/';
                    if (url.includes('/passport')) {
                        url = '/';
                    }
                    this.router.navigateByUrl(url);
                });
            }, (error: any) => {
                this.loginLoading = false;
                this.msg.error('登陆失败: ' + error.error.msg);
            });

        // /**
        //  * 模拟进行登录操作
        //  */
        // this.mockLoading = true;
        // setTimeout(() => {
        //     this.mockLoading = false;
        //     if (this.userName.value !== "admin" || this.password.value !== "123") {
        //         this.error = "用户名密码输入错误！";
        //         return;
        //     }
        //
        //     // 清空路由复用信息
        //     this.reuseTabService.clear();
        //     // 设置用户信息
        //     this.settingsService.setUser({
        //         name: '管理员',
        //         avatar: './assets/images/avatar.jpg'
        //     });
        //     // 设置用户Token信息
        //     this.tokenService.set({
        //         token: window.btoa(JSON.stringify({
        //             token: '12345',
        //             validTime: (new Date().getTime())
        //         }))
        //     });
        //     // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        //     this.startupSrv.load().then(() => {
        //         let url = this.tokenService.referrer!.url || '/';
        //         if (url.includes('/passport')) {
        //             url = '/';
        //         }
        //         this.router.navigateByUrl(url);
        //     });
        //
        // }, 3000)

    }

    ngOnDestroy(): void {

    }
}
