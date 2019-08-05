import { ApplicationRef, Injectable } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { UpdateActivatedEvent, UpdateAvailableEvent } from '@angular/service-worker';
import { IAppData } from '@core/ui/sw.interface';
import { concat, interval } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable()
export class SwService {
  VAPID_PUBLIC_KEY = 'BI8U9Z-ABgBHwmbBj9IhiEHqx80FE9ezYgmdxZtdk_nFtW61QAjfC3qRPWaI00XfPppScpX5X9wecBZyENvxvGg';

  constructor(private updates: SwUpdate, private swPush: SwPush, appRef: ApplicationRef) {
    if (updates.isEnabled) {
      console.log('Service Worker init...');
      updates.available.subscribe((event: UpdateAvailableEvent) => {
        console.log('SwService available 事件信号:', event);
        const appData: IAppData = event.available.appData;
        if (!appData || appData.force) {
          this.updates.activateUpdate().then(() => {
            document.location.reload();
          });
        }
      });

      updates.activated.subscribe((event: UpdateActivatedEvent) => {
        console.log('SwService activated 事件信号:', event);
      });

      const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
      const everySixHours$ = interval(15 * 60 * 1000);
      const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);
      everySixHoursOnceAppIsStable$.subscribe(() => {
        console.log('检查客户端UI更新');
        updates.checkForUpdate();
      });
      updates.checkForUpdate();
      this.subscribeToPush();
    } else {
      console.warn('Service Worker 被禁用或者浏览器不支持');
    }
  }

  PromptUpdate() {}

  subscribeToPush() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then(sub => {
        console.log(sub);
      })
      .catch(err => {
        console.error('Could not subscribe to notifications', err);
      });
  }
}
