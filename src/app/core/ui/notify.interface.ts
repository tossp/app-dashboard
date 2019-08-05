import { NzMessageDataFilled, NzNotificationData, NzNotificationDataOptions } from 'ng-zorro-antd';
import { Subject } from 'rxjs';

export interface INotify extends NzNotificationData {
  obs: Subject<NzMessageDataFilled>;
  options?: NzNotificationDataOptions;
}

export interface ICBNotify extends NzNotificationData {
  id: symbol;
  handler: NzMessageDataFilled;
}
