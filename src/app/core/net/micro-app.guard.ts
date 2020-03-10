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
        const token = this._tokenService.get().token;
        console.log('token - - - -- ' + token);
        if (!token) {
            this._navigate('/passport/login');
            return false;
        } else {
            return true;
        }
    }

    private _navigate(url: string) {
        setTimeout( () => {
            this._injector.get(Router).navigateByUrl(url);
        })
    }

}
