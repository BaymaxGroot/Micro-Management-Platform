// tslint:disable: no-duplicate-imports
import {NgModule, LOCALE_ID, APP_INITIALIZER, Injector} from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// #region default language
// Reference: https://ng-alain.com/docs/i18n
import {default as ngLang} from '@angular/common/locales/zh';
import {NZ_I18N, zh_CN as zorroLang} from 'ng-zorro-antd/i18n';
import {DELON_LOCALE, zh_CN as delonLang} from '@delon/theme';

const LANG = {
    abbr: 'zh',
    ng: ngLang,
    zorro: zorroLang,
    delon: delonLang,
};
// register angular
import {registerLocaleData} from '@angular/common';

registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES = [
    {provide: LOCALE_ID, useValue: LANG.abbr},
    {provide: NZ_I18N, useValue: LANG.zorro},
    {provide: DELON_LOCALE, useValue: LANG.delon},
];
// #endregion

// #region JSON Schema form (using @delon/form)
import {JsonSchemaModule} from '@shared/json-schema/json-schema.module';

const FORM_MODULES = [JsonSchemaModule];
// #endregion


// #region Http Interceptors
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {MicroAppInterceptor} from "@core/net/micro-app.interceptor ";

const INTERCEPTOR_PROVIDES = [
    {provide: HTTP_INTERCEPTORS, useClass: MicroAppInterceptor, multi: true}
];
// #endregion

// #region global third module
const GLOBAL_THIRD_MODULES = [];
// #endregion

// #region Startup Service
import {StartupService} from '@core/startup/startup.service';

export function StartupServiceFactory(startupService: StartupService) {
    return () => startupService.load();
}

const APPINIT_PROVIDES = [
    StartupService,
    {
        provide: APP_INITIALIZER,
        useFactory: StartupServiceFactory,
        deps: [StartupService],
        multi: true
    }
];
// #endregion

import {DelonModule} from './delon.module';
import {CoreModule} from '@core/core.module';
import {SharedModule} from '@shared';
import {AppComponent} from './app.component';
import {RoutesModule} from './routes/routes.module';
import {LayoutModule} from './layout/layout.module';
import {UEditorModule} from "ngx-ueditor";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        DelonModule.forRoot(),
        UEditorModule.forRoot({
            // **注：** 建议使用本地路径；以下为了减少 ng-alain 脚手架的包体大小引用了CDN，可能会有部分功能受影响
            js: [`//apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.config.js`, `//apps.bdimg.com/libs/ueditor/1.4.3.1/ueditor.all.min.js`],
            options: {
                UEDITOR_HOME_URL: `//apps.bdimg.com/libs/ueditor/1.4.3.1/`,
            },
        }),
        CoreModule,
        SharedModule,
        LayoutModule,
        RoutesModule,
        ...FORM_MODULES,
        ...GLOBAL_THIRD_MODULES
    ],
    providers: [
        ...LANG_PROVIDES,
        ...INTERCEPTOR_PROVIDES,
        ...APPINIT_PROVIDES
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
