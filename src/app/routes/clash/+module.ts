import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { ClashRoutingModule } from './+routing';
import { ClashComponent } from './clash.component';
import { ClashEcComponent } from './clash.ec.component';
import { ClashService } from './clash.service';

const COMPONENTS = [ClashComponent,];
const COMPONENTS_NOROUNT = [ClashEcComponent];
const SERVICE = [ClashService];
const Pipe = [];

@NgModule({
  imports: [SharedModule, ClashRoutingModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT, ...Pipe],
  providers: [...SERVICE],
  entryComponents: COMPONENTS_NOROUNT,
})
export class ClashModule { }
