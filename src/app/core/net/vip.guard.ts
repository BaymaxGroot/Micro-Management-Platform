import {Injectable} from '@angular/core';
import {CanActivate, CanActivateChild} from '@angular/router';
import {Observable} from 'rxjs';
import {SettingsService} from "@delon/theme";

@Injectable({
    providedIn: 'root'
})
export class VipGuard implements CanActivate, CanActivateChild {

    constructor(
        private settingService: SettingsService,
    ) {
    }

    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.settingService.user.role === 3;
    }

    canActivateChild(): Observable<boolean> | Promise<boolean> | boolean {
        return this.settingService.user.role === 3;
    }
}
