import { NgModule, Optional, SkipSelf } from '@angular/core';
import { TsNotifyService } from '@core/ui/notify.service';
import { SwService } from '@core/ui/sw.service';
import { throwIfAlreadyLoaded } from './module-import-guard';

@NgModule({
  providers: [TsNotifyService, SwService],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
