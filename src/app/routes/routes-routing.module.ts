import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {environment} from '@env/environment';
// layout
import {LayoutDefaultComponent} from '../layout/default/default.component';
import {LayoutFullScreenComponent} from '../layout/fullscreen/fullscreen.component';
import {LayoutPassportComponent} from '../layout/passport/passport.component';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';

// 路由守卫
import {MicroAppGuard} from "@core/net/micro-app.guard";
import {SettingsService} from "@delon/theme";
import {SellComponent} from "./sell/sell.component";
import {AdminGuard} from "@core/net/admin.guard";
import {DistributorGuard} from "@core/net/distributor.guard";
import {VipGuard} from "@core/net/vip.guard";

const routes: Routes = [
    {
        path: '',
        component: LayoutDefaultComponent,
        // 开启路由守卫
        canActivate: [MicroAppGuard],
        canActivateChild: [MicroAppGuard],
        children: [
            /**
             * 普通管理员路由设置
             */
            // 商品管理模块
            {
                path: 'good',
                canActivate: [AdminGuard],
                canActivateChild: [AdminGuard],
                loadChildren: () => import('./good/good.module').then(m => m.GoodModule)
            },
            // 订单管理模块
            {
                path: 'order',
                canActivate: [AdminGuard],
                canActivateChild: [AdminGuard],
                loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
            },
            // 用户管理模块
            {
                path: 'user',
                canActivate: [AdminGuard],
                canActivateChild: [AdminGuard],
                loadChildren: () => import('./user/user.module').then(m => m.UserModule)
            },
            // 分销中心模块
            {
                path: 'distribution', canActivate: [AdminGuard], canActivateChild: [AdminGuard],
                loadChildren: () => import('./distribution/distribution.module').then(m => m.DistributionModule)
            },
            {
                path: 'setting',
                canActivate: [AdminGuard],
                canActivateChild: [AdminGuard],
                loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
            },

            /**
             * 分销商路由设置
             */
            {
                path: 'sell',
                canActivate: [DistributorGuard],
                canActivateChild: [DistributorGuard],
                component: SellComponent
            },


            /**
             * 会员路由设置
             */
            {
                path: 'vip',
                canActivate: [VipGuard],
                canActivateChild: [VipGuard],
                loadChildren: () => import('./vip/vip.module').then(m => m.VipModule)
            },

            /**
             * 其余路由设置
             */
            {
                path: 'exception',
                loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule)
            }
        ]
    },
    // 全屏布局
    {
        path: 'fullscreen',
        component: LayoutFullScreenComponent,
        children: []
    },
    // 用户登录模块
    {
        path: 'passport',
        component: LayoutPassportComponent,
        children: [
            {path: 'login', component: UserLoginComponent, data: {title: '登录', titleI18n: '登录'}}
        ]
    },
    // 单页不包裹Layout
    {path: '**', redirectTo: 'exception/404'},
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            routes, {
                useHash: environment.useHash,
                // NOTICE: If you use `reuse-tab` component and turn on keepingScroll you can set to `disabled`
                // Pls refer to https://ng-alain.com/components/reuse-tab
                scrollPositionRestoration: 'top',
            }
        )],
    exports: [RouterModule],
})
export class RouteRoutingModule {
    constructor(private settingService: SettingsService,) {
    }
}
