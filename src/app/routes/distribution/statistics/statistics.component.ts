import {Component, OnInit} from '@angular/core';
import {SettingsService} from "@delon/theme";
import {NzMessageService} from "ng-zorro-antd";
import {MicroAppService} from "@core/net/micro-app.service";
import {STColumn} from "@delon/abc";
import {Interface} from "../../../lib/enums/interface.enum";

@Component({
    selector: 'micro-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.less']
})
export class StatisticsComponent implements OnInit {

    constructor(
        private settingService: SettingsService,
        private msg: NzMessageService,
        private _microAppHttpClient: MicroAppService
    ) {
    }

    listDateRange: Date[];
    isPrintingExcel: boolean = false;

    isLoadingList: boolean = false;
    tableList = [];
    tableColumnSetting: STColumn[] = [
        {title: '分销商', index: 'shop_name'},
        {title: '订单数', index: 'order_count', type: "number"},
        {title: '总金额', index: 'total_price'}
    ];

    ngOnInit() {
        this.listDateRange = [
            new Date( new Date().getTime() - 30 * 24 * 60 * 60 * 1000 ),
            new Date(),
        ];
        this.loadTableList();
    }

    loadTableList() {
        this.isLoadingList = true;
        this.tableList = [];
        this._microAppHttpClient.get(`${Interface.StatisticsEndPoint}?start=${this.listDateRange[0].getTime()}&end=${this.listDateRange[1].getTime()}`).subscribe( data => {
            if(data) {
                this.tableList = data;
            }
            this.isLoadingList = false;
        }, error => {
            this.msg.error('请求失败，请重试！');
            this.isLoadingList = false;
        } )
    }

    handleChangeListDate(result: Date[]) {
        this.listDateRange = result;
        this.loadTableList();
    }

    handlePrintStatisticsList() {
        this.isPrintingExcel = true;
        this._microAppHttpClient.post(Interface.DownloadStatisticsEndPoint, {
            start: this.listDateRange[0].getTime(),
            end: this.listDateRange[1].getTime()
        }).subscribe( data => {
            this.msg.info('订单信息下载中....');
            window.open(data);
            setTimeout(() => {
                this.isPrintingExcel = false;
            }, 1000);
        } , error => {
            this.msg.error('下载销售统计失败，请重试!');
            this.isPrintingExcel = false;
        })
    }
}
