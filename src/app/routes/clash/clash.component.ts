import { HttpErrorResponse, HttpResponseBase } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { Subscriber, Subscription } from 'rxjs';
import { ClashEcComponent } from './clash.ec.component';
import { ClashService } from './clash.service';
import { AdapterType, IAdaptersProxy, IConfig, IGroupProxy, ILogs, IProxies, IRule, RuleType } from './interface';

@Component({
  selector: 'app-dashboard-clash',
  templateUrl: './clash.component.html',
  styleUrls: ['./clash.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClashComponent implements OnInit {
  ec = this.srv.ec;
  config: IConfig = {};
  groupProxy: { [name: string]: IGroupProxy } = {};
  adaptersProxy: { [name: string]: IAdaptersProxy } = {};
  rules: IRule[] = [];
  logs: ILogs[] = [];
  trafficData: any[] = [];
  trafficTitle = { y1: '出口流量', y2: '入口流量' };
  configForm: FormGroup = this.fb.group({
    'allow-lan': [this.config['allow-lan'], [Validators.required, Validators.min(1), Validators.max(65535)]],
    'log-level': [this.config['log-level'], [Validators.required]],
    'redir-port': [this.config['redir-port'], [Validators.required, Validators.min(1), Validators.max(65535)]],
    'socks-port': [this.config['socks-port'], [Validators.required, Validators.min(1), Validators.max(65535)]],
    mode: [this.config.mode, [Validators.required]],
    port: [this.config.port, [Validators.required, Validators.min(1), Validators.max(65535)]],
  });
  constructor(
    private srv: ClashService,
    public msg: NzMessageService,
    private i18n: I18NService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private modal: ModalHelper,
  ) {}
  private _editEc: Subscription;
  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.srv.restart();
    this.srv.configs.subscribe(d => {
      this.config = d;
      // this.makeValidateForm()
      this.configForm.setValue(this.config);
      this.cdr.detectChanges();
    });
    this.srv.error.subscribe(ev => {
      console.warn('未可知错误', ev, ev instanceof HttpResponseBase);
      if (ev instanceof HttpErrorResponse) {
        switch (ev.status) {
          case 0:
          case 401:
            this.editEc();
        }
      }
    });
    this.srv.proxies.subscribe(d => {
      this.groupProxy = {};
      this.adaptersProxy = {};
      Object.keys(d).forEach(key => {
        switch (d[key].type) {
          case AdapterType.Fallback:
          case AdapterType.Selector:
          case AdapterType.LoadBalance:
          case AdapterType.URLTest:
            this.groupProxy[key] = d[key] as IGroupProxy;
            break;
          case AdapterType.Direct:
          case AdapterType.Reject:
            break;
          case AdapterType.Socks5:
          case AdapterType.Http:
          case AdapterType.Vmess:
          case AdapterType.Shadowsocks:
            this.adaptersProxy[key] = d[key] as IAdaptersProxy;
            break;
          case AdapterType.Unknow:
            console.warn('未知类型', d[key]);
            break;
          default:
            console.error('没有拦截到的类型', d[key]);
            break;
        }
      });
      this.cdr.detectChanges();
    });
    this.srv.rules.subscribe(d => {
      this.rules = [];
      const tmp: { [name: string]: string[] } = {};
      d.forEach(element => {
        tmp[`${element.type}|${element.proxy}`] = tmp[`${element.type}|${element.proxy}`] || [];
        tmp[`${element.type}|${element.proxy}`].push(element.payload);
      });
      Object.keys(tmp).forEach(key => {
        const t = key.split('|');
        let has = false;
        this.rules.forEach(v => {
          if (key === `${v.type}|${v.proxy}`) {
            has = true;
            v.payloads = tmp[key];
          }
        });
        if (!has) {
          this.rules.push({ type: RuleType[t[0]], proxy: t[1], payloads: tmp[key] });
        }
      });
      // this.rules = d
      this.cdr.detectChanges();
    });
    this.srv.logs.subscribe(d => {
      this.logs = d.reverse();
      this.cdr.detectChanges();
    });
    this.srv.traffic.subscribe(d => {
      const num = d.length;
      const now = new Date().getTime();
      d.map((v, k) => {
        v.x = now - 1000 * (num - k);
        v.y1 = v.up / 1024;
        v.y2 = v.down / 1024;
      });
      this.trafficData = d;
      this.trafficTitle.y1 = `出口流量${d[d.length - 1].y1.toFixed(2)}KB/s`;
      this.trafficTitle.y2 = `入口流量${d[d.length - 1].y2.toFixed(2)}KB/s`;
      this.cdr.detectChanges();
    });
  }
  selectorChange(e: boolean, item, i: string) {
    if (!e) {
      return;
    }
    this.delay(i);
    this.srv.setSelector(item.key, i).subscribe(x => {
      this.srv.restart();
    });
  }
  proxiestrackByFn(index: number, item: any) {
    return item.key || index;
  }
  delayToColor(delay: number) {
    let color = '';
    switch (true) {
      case delay === 0:
        color = 'grey';
        break;
      case delay <= 100:
        color = 'green';
        break;
      case delay <= 500:
        color = 'lime';
        break;
      case delay <= 1000:
        color = 'gold';
        break;
      case delay <= 2000:
        color = 'orange';
        break;
      case delay <= 3000:
        color = 'volcano';
        break;
      case delay <= 4000:
        color = 'magenta';
        break;
      default:
        color = 'red';
        break;
    }
    return color;
  }
  logsToColor(type: string) {
    let color = '';
    switch (type) {
      case 'debug':
        color = 'grey';
        break;
      case 'info':
        color = 'blue';
        break;
      case 'warning':
        color = 'orange';
        break;
      case 'error':
        color = 'red';
        break;
      default:
        color = 'purple';
        break;
    }
    return color;
  }
  nameToColor(name: string) {
    let color = 'purple';
    if (!this.adaptersProxy[name]) {
      return color;
    }
    const history = this.adaptersProxy[name].history;
    if (history && history[history.length - 1]) {
      color = this.delayToColor(history[history.length - 1].delay);
    }
    return color;
  }
  delay(name: string) {
    if (!this.adaptersProxy[name]) {
      return;
    }
    if (!this.adaptersProxy[name].history) {
      return;
    }
    this.srv.delay(name).subscribe(x => {
      this.srv.restart();
    });
  }

  handleConfigChange(ev, key: string): void {
    console.log('handleConfigChange', ev, key);
  }

  submitForm() {
    Object.keys(this.configForm.controls).forEach(key => {
      this.configForm.controls[key].markAsDirty();
      this.configForm.controls[key].updateValueAndValidity();
    });
  }
  restart() {
    this.srv.restart();
  }

  editEc() {
    if (this._editEc && !this._editEc.closed) {
      return;
    }
    this._editEc = this.modal.create(ClashEcComponent, { record: this.ec }).subscribe(res => {
      if (res) {
        this.restart();
        this.ec = this.srv.ec;
      }
    });
  }
}
