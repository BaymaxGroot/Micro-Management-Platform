import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'micro-wanted',
    templateUrl: './wanted.component.html',
    styleUrls: ['./wanted.component.less']
})
export class WantedComponent implements OnInit {

    dateFormat = 'yyyy/MM/dd';

    constructor() {
    }

    ngOnInit() {
    }

}
