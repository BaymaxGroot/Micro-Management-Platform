import {Injectable, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {zip} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {MenuService, SettingsService, TitleService} from '@delon/theme';
import {DA_SERVICE_TOKEN, ITokenService} from '@delon/auth';
import {ACLService} from '@delon/acl';

import {NzIconService} from 'ng-zorro-antd/icon';
import {ICONS_AUTO} from '../../../style-icons-auto';
import {ICONS} from '../../../style-icons';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
    constructor(
        iconSrv: NzIconService,
        private menuService: MenuService,
        private aclService: ACLService,
        private titleService: TitleService,
        private settingService: SettingsService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
        private httpClient: HttpClient
    ) {
        iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
    }

    private getNavigationJson() {
        switch (this.settingService.user.role) {
            case 1:
                return 'assets/admin.json';
            case 2:
                return 'assets/distributor.json';
            case 3:
                return 'assets/vip.json';
        }
    }

    private viaHttp(resolve: any, reject: any) {
        zip(
            this.httpClient.get(this.getNavigationJson())
        ).pipe(
            catchError(([appData]) => {
                resolve(null);
                return [appData];
            })
        ).subscribe(([appData]) => {
                // Application data
                const res: any = appData;
                /**
                 * 移除向浏览器LocalStorage 注册用户和应用 信息功能
                 * // User information: including name, avatar, email address
                 * this.settingService.setUser(res.user);
                 */
                // Application information: including site name, description, year
                this.settingService.setApp(res.app);
                // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
                this.aclService.setFull(true);
                // Menu data, https://ng-alain.com/theme/menu
                this.menuService.add(res.menu);
                // Can be set page suffix title, https://ng-alain.com/theme/title
                this.titleService.suffix = res.app.name;
            },
            () => {
            },
            () => {
                resolve(null);
            });
    }

    load(): Promise<any> {
        // only works with promises
        // https://github.com/angular/angular/issues/15088
        return new Promise((resolve, reject) => {

            this.viaHttp(resolve, reject);

        });
    }
}
