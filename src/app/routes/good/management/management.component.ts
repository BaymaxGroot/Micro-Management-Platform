import {Component, OnInit} from '@angular/core';
import {STColumn, STColumnTag, STData} from "@delon/abc";

const TAG: STColumnTag = {
    0: {text: '已下架', color: ''},
    1: {text: '已上架', color: 'green'},
};

@Component({
    selector: 'micro-management',
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.less']
})
export class ManagementComponent implements OnInit {

    /**
     * 商品列表设置
     */
    columnsSetting: STColumn[] = [
        {title: 'ID', index: 'id'},
        {
            title: '商品类型', index: 'category', filter: {
                menus: [
                    {text: '助力抗疫', value: '助力抗疫'},
                    {text: '爱心义卖', value: '爱心义卖'}
                ],
                fn: (filter, record) => {
                    return record.category == filter.value;
                }
            }
        },
        {
            title: '商品名称', index: 'name', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.name.indexOf(filter.value) !== -1
                },
            },
        },
        {title: '商品图片', index: 'icon', type: 'img'},
        {title: {text: '售价', optional: '（单位：元）'}, index: 'price'},
        {title: '库存', index: 'remain'},
        {
            title: '状态', index: 'status', type: 'tag', tag: TAG, filter: {
                menus: [
                    {text: '已上架', value: 1},
                    {text: '已下架', value: 0}
                ],
                fn: (filter, record) => {
                    return record.status == filter.value;
                }
            }
        },
        {title: '虚拟数量', index: 'virtual'},
        {title: '实际数量', index: 'real'},
        {title: '排序', index: 'rank'},
        {
            title: '操作', buttons: [
                {
                    text: (record, btn) => {
                        return record.status ? '下架' : '上架';
                    }, type: 'none', click: (record, modal, instance) => {
                    }
                },
                {
                    text: '修改', type: 'none', click: (record, modal, instance) => {
                    }
                },
                {
                    text: '复制链接', type: 'none', click: (record, modal, instance) => {
                    }
                },
                {
                    text: '删除', type: 'del', click: (record, modal, instance) => {
                    }
                },
            ]
        }
    ];
    /**
     * 商品信息Mock数据
     */
    mockData: STData[] = [
        {
            'id': 60288,
            'category': '助力抗疫',
            'name': '鸡蛋',
            'icon': 'http://b-ssl.duitang.com/uploads/item/201802/20/20180220165946_RiGPS.thumb.700_0.jpeg',
            'price': 12,
            'remain': 0,
            'status': 0,
            'virtual': 0,
            'real': 120,
            'rank': 1
        },
        {
            'id': 23456,
            'category': '爱心义卖',
            'name': '牛肉',
            'icon': 'http://b-ssl.duitang.com/uploads/item/201802/20/20180220165946_RiGPS.thumb.700_0.jpeg',
            'price': 12,
            'remain': 0,
            'status': 1,
            'virtual': 0,
            'real': 120,
            'rank': 1
        },
    ];

    /**
     *
     */

    /**
     *
     */
    constructor() {
    }

    ngOnInit() {
    }

}
