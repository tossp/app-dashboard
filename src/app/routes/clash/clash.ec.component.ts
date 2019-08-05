import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema } from '@delon/form';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { ClashService } from './clash.service';

@Component({
  templateUrl: './clash.ec.component.html',
})
export class ClashEcComponent implements OnInit {
  @Input()
  record: any = {};
  @ViewChild('sf', { static: true })
  sf: SFComponent;
  i: any;
  schema: SFSchema = {
    ui: {
      liveValidate: true,
      firstVisual: false,
      spanLabelFixed: 100,
      grid: { span: 24 },
    },
    properties: {
      host: {
        type: 'string',
        title: '主机',
        minLength: 2,
        ui: { grid: { span: 12 }, optionalHelp: '请输入团队名称' },
      },
      port: {
        type: 'number',
        title: '端口',
        ui: { grid: { span: 12 }, optionalHelp: '请输入端口' },
      },
      secret: {
        type: 'string',
        title: '密钥',
        ui: { grid: { span: 24 }, optionalHelp: '请输入密钥' },
      },

      numLogs: {
        type: 'number',
        title: '日志数量',
        ui: { grid: { span: 12 }, optionalHelp: '日志数量' },
      },
      numTraffic: {
        type: 'number',
        title: '流量容量',
        ui: { grid: { span: 12 }, optionalHelp: '流量容量' },
      },
    },
    required: ['host', 'port', 'numLogs', 'numTraffic'],
  };

  constructor(private modal: NzModalRef, public msgSrv: NzMessageService,
    private serv: ClashService, ) { }

  get loading() {
    return this.serv.loading;
  }

  ngOnInit(): void {
    // this.http.get(`/user/${this.record.id}`).subscribe(res => this.i = res);
  }

  save(value: any) {
    if (!this.sf.validator().valid) {
      this.sf.rootProperty.errors.forEach(err => {
        this.msgSrv.warning(`${this.sf.getProperty(err.dataPath).schema.title},${err.message}`);
      });
      return;
    }
    this.serv.setEc(value).subscribe(
      (res: any) => {
        this.msgSrv.success('修改信息成功');
        this.modal.close(true);
      },
    );
  }

  close() {
    this.modal.destroy();
  }
}
