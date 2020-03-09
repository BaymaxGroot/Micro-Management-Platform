import {Component, OnInit} from '@angular/core';
import {STColumn, STData} from "@delon/abc";

@Component({
    selector: 'micro-wanted',
    templateUrl: './wanted.component.html',
    styleUrls: ['./wanted.component.less']
})
export class WantedComponent implements OnInit {

    dateFormat = 'yyyy/MM/dd';
    /**
     * 用户想要商品列表
     */
    columnsSetting: STColumn[] = [
        {title: '商品类型', index: 'category'},
        {title: '商品名称', index: 'name'},
        {title: '描述', index: 'description'},
        {title: '用户', index: 'user'},
        {title: '时间', index: 'time', type: "date"}
    ];
    /**
     * 用户想要商品 mock数据
     */
    mockData: STData[] = [
        {
            'category': '肉蛋类',
            'name': '华伯黑猪五花肉',
            'description': '我要买华伯黑猪五花肉有吗？',
            'user': '白兰花（冯秀挺）',
            'time': '2020-03-04 08:56'
        },
        {'category': '口罩', 'name': '口罩', 'description': '口罩', 'user': '我是昵称', 'time': '2020-03-01 10:09'}
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
