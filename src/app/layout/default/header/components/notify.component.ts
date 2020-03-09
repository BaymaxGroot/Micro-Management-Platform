import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { NzMessageService } from 'ng-zorro-antd';
import { NoticeItem, NoticeIconList } from '@delon/abc';

/**
 * 菜单通知
 */
@Component({
  selector: 'header-notify',
  template: `
    <notice-icon
      [data]="data"
      [count]="count"
      [loading]="loading"
      btnClass="alain-default__nav-item"
      btnIconClass="alain-default__nav-item-icon"
      (select)="select($event)"
      (clear)="clear($event)"
      (popoverVisibleChange)="loadData()"
    ></notice-icon>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNotifyComponent {
  data: NoticeItem[] = [
    {
      title: '消息',
      list: [],
      emptyText: '您已读完所有消息',
      emptyImage: 'https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg',
      clearText: '清空消息',
    }
  ];
  count = 5;
  loading = false;

  constructor(private msg: NzMessageService, private cdr: ChangeDetectorRef) {}

  private updateNoticeData(notices: NoticeIconList[]): NoticeItem[] {
    const data = this.data.slice();
    data.forEach(i => (i.list = []));

    notices.forEach(item => {
      const newItem = { ...item };
      if (newItem.datetime)
        newItem.datetime = distanceInWordsToNow(item.datetime!, {
          locale: (window as any).__locale__,
        });
      if (newItem.extra && newItem.status) {
        newItem.color = {
          todo: undefined,
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newItem.status];
      }
      data.find(w => w.title === newItem.type)!.list.push(newItem);
    });
    return data;
  }

  loadData() {
    if (this.loading) return;
    this.loading = true;
    setTimeout(() => {
      this.data = this.updateNoticeData([
        {
          id: '000000006',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '曲丽丽 评论了你',
          description: '描述信息描述信息描述信息',
          datetime: '2017-08-07',
          type: '消息',
        },
        {
          id: '000000007',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '朱偏右 回复了你',
          description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
          datetime: '2017-08-07',
          type: '消息',
        },
        {
          id: '000000008',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/fcHMVNCjPOsbUGdEduuv.jpeg',
          title: '标题',
          description: '这种模板用于提醒谁与你发生了互动，左侧放『谁』的头像',
          datetime: '2017-08-07',
          type: '消息',
        }
      ]);
      this.loading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  clear(type: string) {
    this.msg.success(`清空了 ${type}`);
  }

  select(res: any) {
    this.msg.success(`点击了 ${res.title} 的 ${res.item.title}`);
  }
}
