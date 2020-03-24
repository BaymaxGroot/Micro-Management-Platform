import {Component, OnInit} from '@angular/core';
import {STColumn, STData} from "@delon/abc";

@Component({
    selector: 'micro-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class ListComponent implements OnInit {

    dateFormat = 'yyyy/MM/dd';

    constructor() {
    }

    ngOnInit() {
    }

    /**
     * 订单列表
     */
    orderColumnsSetting: STColumn[] = [
        {title: '订单号', index: 'oid'},
        {title: '用户', index: 'ouser'},
        {title: '下单时间', index: 'otime'},
        {title: '总金额', index: 'omoney'}
    ];

    /**
     * 订单虚拟数据
     */
    orderMockData: STData[] = [
        {
            oid: '20200322174618260859',
            ouser: '（ID：1545865）用户：勤宇海坤',
            otime: '2020-03-22 17:46:28',
            omoney: '66.20元',
            description: '你好呀嘻嘻',
            expand: true
        },
        {
            oid: '20200322174618260859',
            ouser: '（ID：1545865）用户：勤宇海坤',
            otime: '2020-03-22 17:46:28',
            omoney: '66.20元',
            description: '你好呀嘻嘻',
            expand: false
        }
    ];

}
