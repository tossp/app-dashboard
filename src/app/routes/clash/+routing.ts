import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClashComponent } from './clash.component';

const routes: Routes = [

  { path: '', redirectTo: 'index', pathMatch: 'full' },
  {
    path: 'index', component: ClashComponent, data: { title: 'Clash管理' },
  },
  { path: '**', redirectTo: 'index' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClashRoutingModule { }
