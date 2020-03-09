import {Component, OnInit} from '@angular/core';
import {STColumn, STData} from "@delon/abc";

@Component({
    selector: 'micro-evaluation',
    templateUrl: './evaluation.component.html',
    styleUrls: ['./evaluation.component.less']
})
export class EvaluationComponent implements OnInit {

    columnsSetting: STColumn[] = [
        {title: 'ID', index: 'id'},
        {title: '商品名称', width: 80, index: 'name'},
        {title: '用户', width: 80, index: 'user'},
        {
            title: '评分', width: 80, index: 'grade', sort: {
                compare: (a, b) => (a.grade < b.grade ? -1 : 1),
            },
        },
        {title: '详情', index: 'detail'},
        {title: '评价回复', index: 'reply'},
        {
            title: '操作', width: 100, buttons: [
                {text: '回复', type: 'none', click: (record, modal, instance) => {}},
                {text: '隐藏', type: 'none', click: (record, modal, instance) => {}},
                {text: '删除', type: 'del', click: (record, modal, instance) => {}},
            ]
        }
    ];

    mockData: STData[] = [
        {
            'id': 123,
            'name': '【爱心助农】江阴青阳荸荠 10元/5斤',
            'user': '白兰花（冯秀挺）',
            'grade': '差评',
            'detail': '短斤缺两超级严重，我这虽然是帮助别人的义举，自己也吃不掉那么多，正常配送量也是分给大家做做这平台的广告，但收到的实货3斤都不到，打了3折，我做了好事你不能缺失诚信。以后再也不会来这种所谓【爱心助农】了',
            'reply': '我们已经电话和您沟通，我们会马上联系农户，帮您解决这个问题，感谢您对本平台的支持！'
        },
        {
            'id': 123342,
            'name': '【华伯食品】高品质乡草猪肉，新鲜直达',
            'user': '白兰花（冯秀挺）',
            'grade': '好评',
            'detail': '很好萝卜口感细腻。',
            'reply': ''
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

}
