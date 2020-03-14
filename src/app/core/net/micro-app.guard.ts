import {Inject, Injectable, Injector} from '@angular/core';
import {CanActivate, CanActivateChild, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

@Injectable({
    providedIn: 'root'
})
export class MicroAppGuard implements CanActivate, CanActivateChild {

    constructor(
        @Inject(DA_SERVICE_TOKEN) private _tokenService: ITokenService,
        private _router: Router,
        private _injector: Injector
    ) {
    }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this._login();
    }

    canActivateChild(): Observable<boolean> | Promise<boolean> | boolean {
        return this._login();
    }

    private _login() {
        try {
            const tokenobj = JSON.parse(window.atob(this._tokenService.get().token));
            if (tokenobj && ('token' in tokenobj) && ('validTime' in tokenobj) && ('user' in tokenobj) && ((new Date().getTime() - tokenobj.validTime) / 1000 / 60 < 60)) {

                // 重新设置用户Token 有效时间
                this._tokenService.set({
                    token: window.btoa(JSON.stringify({
                        token: tokenobj.token,
                        user: tokenobj.user,
                        validTime: (new Date().getTime())
                    }))
                });

                return true
            } else {
                this._navigate('/passport/login');
                return false;
            }
        } catch (e) {
            this._navigate('/passport/login');
            return false;
        }
    }

    private _navigate(url: string) {
        setTimeout(() => {
            this._injector.get(Router).navigateByUrl(url);
        })
    }

}
