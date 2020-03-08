import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {SimpleGuard} from '@delon/auth';
import {environment} from '@env/environment';
// layout
import {LayoutDefaultComponent} from '../layout/default/default.component';
import {LayoutFullScreenComponent} from '../layout/fullscreen/fullscreen.component';
import {LayoutPassportComponent} from '../layout/passport/passport.component';
// passport pages
import {UserLoginComponent} from './passport/login/login.component';
// single pages
import {CallbackComponent} from './callback/callback.component';
import {UserLockComponent} from './passport/lock/lock.component';
// dashboard page
import {DashboardComponent} from "./dashboard/dashboard.component";

const routes: Routes = [
    {
        path: '',
        component: LayoutDefaultComponent,
        canActivate: [SimpleGuard],
        children: [
            {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
            {path: 'dashboard', component: DashboardComponent},
            // 商品管理模块
            {path: 'good', loadChildren: () => import('./good/good.module').then(m => m.GoodModule)},
            // 订单管理模块
            {path: 'order', loadChildren: () => import('./order/order.module').then(m => m.OrderModule)},
            // 用户管理模块
            {path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule)},
            // 分销中心模块
            {
                path: 'distribution',
                loadChildren: () => import('./distribution/distribution.module').then(m => m.DistributionModule)
            },
            // 内容管理模块
            {path: 'content', loadChildren: () => import('./content/content.module').then(m => m.ContentModule)},

            // { path: 'dashboard', component: DashboardComponent, data: { title: '仪表盘', titleI18n: 'dashboard' } },
            {
                path: 'exception',
                loadChildren: () => import('./exception/exception.module').then(m => m.ExceptionModule)
            },
            // 业务子模块
            // { path: 'widgets', loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule) },
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
            {path: 'login', component: UserLoginComponent, data: {title: '登录', titleI18n: 'pro-login'}},
            {path: 'lock', component: UserLockComponent, data: {title: '锁屏', titleI18n: 'lock'}},
        ]
    },
    // 单页不包裹Layout
    {path: 'callback/:type', component: CallbackComponent},
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
}
