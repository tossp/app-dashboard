import { Injectable } from '@angular/core';
import { INotify } from '@core/ui/notify.interface';
import { SwService } from '@core/ui/sw.service';
import { NzMessageDataFilled, NzNotificationDataOptions } from 'ng-zorro-antd';
import { Subject } from 'rxjs';
import { last } from 'rxjs/operators';

@Injectable()
export class TsNotifyService {
  constructor(private us: SwService) {
    this.us.PromptUpdate();
  }
  private subject = new Subject<INotify>();

  get$() {
    return this.subject.pipe();
  }

  nextNotify$(
    type: 'success' | 'info' | 'warning' | 'error' | 'blank' | string,
    title: string,
    content: string,
    options?: NzNotificationDataOptions,
  ) {
    const sub = new Subject<NzMessageDataFilled>();
    const vv: INotify = {
      obs: sub,
      type,
      title,
      content,
      options,
    };
    this.subject.next(vv);
    return sub.pipe(last());
  }

  success$(title: string, content: string, options?: NzNotificationDataOptions) {
    return this.nextNotify$('success', title, content, options);
  }

  info$(title: string, content: string, options?: NzNotificationDataOptions) {
    return this.nextNotify$('info', title, content, options);
  }

  warning$(title: string, content: string, options?: NzNotificationDataOptions) {
    return this.nextNotify$('warning', title, content, options);
  }

  error$(title: string, content: string, options?: NzNotificationDataOptions) {
    return this.nextNotify$('error', title, content, options);
  }

  blank$(title: string, content: string, options?: NzNotificationDataOptions) {
    return this.nextNotify$('blank', title, content, options);
  }
}
