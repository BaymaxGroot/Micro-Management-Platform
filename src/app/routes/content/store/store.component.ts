import {Component, OnInit} from '@angular/core';
import {STColumn, STColumnTag, STData} from "@delon/abc";

const STOREOPENTAG: STColumnTag = {
    0: {text: '打烊了', color: ''},
    1: {text: '营业中', color: 'green'},
};

@Component({
    selector: 'micro-store',
    templateUrl: './store.component.html',
    styleUrls: ['./store.component.less']
})
export class StoreComponent implements OnInit {

    /**
     * 商品列表设置
     */
    columnsSetting: STColumn[] = [
        {
            title: 'ID', index: 'id', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || String(record.id).indexOf(filter.value) !== -1;
                }
            }
        },
        {title: '排序', index: 'rank'},
        {
            title: '门店名称', index: 'name', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.name.indexOf(filter.value) !== -1;
                }
            }
        },
        {
            title: '联系方式', index: 'phone', filter: {
                type: 'keyword',
                fn: (filter, record) => {
                    return !filter.value || record.phone.indexOf(filter.value) !== -1;
                }
            }
        },
        {title: '门店地址', index: 'address'},
        {
            title: '核销数据', index: 'analytic', format: (item, col, index) => {
                let orders = item.analytic.orders;
                let revenue = item.analytic.revenue;
                return '核销订单: ' + orders + '<br/>' + '销售额: ' + revenue;
            }
        },
        {title: '门店状态', index: 'status', type: 'tag', tag: STOREOPENTAG},
        {
            title: '操作', buttons: [
                {
                    text: (record, btn) => {
                        return record.status ? '打烊' : '营业';
                    }, click: (record, modal, instance) => {
                    }
                },
                {
                    text: '修改', click: (record, modal, instance) => {
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
            'rank': 100,
            'name': '南闸基地',
            'phone': '13685478954',
            'address': '江苏省无锡市江阴市X303',
            'analytic': {
                'orders': 10,
                'revenue': 100
            },
            'status': 1
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
