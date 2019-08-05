import {
  HttpErrorResponse, HttpEventType, HttpResponseBase,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient, ModalHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { ClashEcComponent } from './clash.ec.component';
import { IApiInfo, IConfig, ILogs, IProxies, IProxy, IRule, IRules, ITraffic } from './interface';

@Injectable()
export class ClashService {

  get loading() {
    return this.http.loading;
  }
  get ec() {
    return this._ec;
  }
  get configs() {
    return this._configs$.pipe(filter(data => !!data));
  }
  get proxies() {
    return this._proxies$.pipe(
      filter(data => !!data)
    );
  }
  get rules() {
    return this._rules$.pipe(filter(data => !!data));
  }
  get traffic() {
    return this._traffic$.pipe(
      filter(data => !!data.length)
    );
  }
  get logs() {
    return this._logs$.pipe(filter(data => !!data));
  }
  get error() {
    return this._error$.pipe(
      mergeMap((ev: HttpResponseBase) => {
        return of(ev);
      })
    );
  }

  private get headers(): { Authorization: string } {
    return { Authorization: `Bearer ${this._ec.secret}` };
  }
  private get url(): string {
    return `http://${this._ec.host}:${this._ec.port ? this._ec.port : 80}`;
  }

  constructor(public http: _HttpClient, public msgSrv: NzMessageService,
  ) {
    try {
      const data = localStorage.getItem(this.storageKey)
      this._ec = { ...this._ec, ...JSON.parse(data) }
    } catch (error) {
      // console.log("try", error)
      localStorage.removeItem(this.storageKey)
    }
    console.log("try _ec", this._ec)
  }
  private storageKey = "TsClashService"

  private _ec: IApiInfo = {
    host: "127.0.0.1",
    port: 8080,
    secret: "",
    numLogs: 100,
    numTraffic: 600,
  }
  private _configs$ = new BehaviorSubject<IConfig>(null)
  private _proxies$ = new BehaviorSubject<IProxy>(null)
  private _rules$ = new BehaviorSubject<IRule[]>(null)
  private _logs$ = new BehaviorSubject<ILogs[]>([])
  private _traffic$ = new BehaviorSubject<ITraffic[]>([])
  private _error$ = new Subject()
  private trafficCtrl = {
    need: false,
    sub: null,
    holdValue: [] as ITraffic[],
  }
  private logsCtrl = {
    need: false,
    sub: null,
    holdValue: [] as ILogs[],
  }
  delay(name: string, timeout: number = 5000, url: string = "http://www.gstatic.com/generate_204") {
    return this.http.get(`${this.url}/proxies/${name}/delay`, { "timeout": timeout, "url": url }, { headers: this.headers, observe: "response" })
      .pipe(
        tap((x) => {
          console.log('delay', x)
        },
          err => {
            this.errorHanle(err)
          }),
      );
  }
  setSelector(proxy: string, name: string) {
    return this.http.put(`${this.url}/proxies/${proxy}`, { "name": name }, null, { headers: this.headers, observe: "response" })
      .pipe(
        tap((x) => { },
          err => {
            this.errorHanle(err)
          }),
      );
  }

  testEC() {
    return this.http.get(`${this.url}`, null).pipe();
  }

  setEc(v: IApiInfo) {
    return this.http.get(`http://${v.host}:${v.port ? v.port : 80}/configs`, null, { headers: { Authorization: `Bearer ${v.secret}` }, observe: "body" }).pipe(
      tap((x) => {
        localStorage.setItem(this.storageKey, JSON.stringify(v))
        this._ec = v
      },
        err => {
          this.errorHanle(err)
        }),
    );
  }
  editEc() {

  }
  restart() {
    this.restartTraffic()
    this.restartLog()
    this.getConfigs().subscribe(x => { })
    this.getProxies().subscribe(x => { })
    this.getRules().subscribe(x => { })
  }

  getConfigs() {
    return this.http.get<IConfig>(`${this.url}/configs`, null, { headers: this.headers, observe: "body" })
      .pipe(
        tap(data => {
          console.log(data)
          this._configs$.next(data)
        },
          err => {
            this.errorHanle(err)
          }),
      );
  }

  getProxies() {
    return this.http.get<IProxies>(`${this.url}/proxies`, null, { headers: this.headers, observe: "body" })
      .pipe(
        map(r => r.proxies || {}),
        tap(data => {
          this._proxies$.next(data)
        },
          err => {
            this.errorHanle(err)
          }),
      );
  }

  getRules() {
    return this.http.get<IRules>(`${this.url}/rules`, null, { headers: this.headers, observe: "body" })
      .pipe(
        map(r => r.rules || []),
        tap(data => {
          this._rules$.next(data)
        },
          err => {
            this.errorHanle(err)
          }),
      );
  }
  private errorHanle(ev: HttpResponseBase) {
    if (ev instanceof HttpErrorResponse) {
      switch (ev.status) {
        case 0:
        case 401:
          this.msgSrv.warning(`疑似外部控制设置错误`, { nzDuration: 15000 });
      }
    }
    this._error$.next(ev)
  }
  private restartTraffic() {
    if (!this.trafficCtrl.sub || this.trafficCtrl.sub.closed) {
      this.trafficCtrl.sub = this.traffic$().subscribe(
        r => {
          if (this.trafficCtrl.need) {
            const len = r.length + this.trafficCtrl.holdValue.length
            if (len > this._ec.numTraffic) {
              this._traffic$.next([...this.trafficCtrl.holdValue.slice(r.length - this._ec.numTraffic), ...r].slice(-5))
            } else {
              this._traffic$.next([...this.trafficCtrl.holdValue, ...r])
            }
          } else {
            this._traffic$.next(r)
          }
        },
        err => {
          console.error("流量获取错误", err)
          this.errorHanle(err)
        },
        () => {
          this.trafficCtrl.sub.unsubscribe()
          this.trafficCtrl.sub = null
          this.trafficCtrl.need = true
          this.trafficCtrl.holdValue = this._traffic$.value
          this.restartTraffic()
        }
      )
    }
  }
  private restartLog() {
    if (!this.logsCtrl.sub || this.logsCtrl.sub.closed) {
      this.logsCtrl.sub = this.logs$().subscribe(
        r => {
          if (this.logsCtrl.need) {
            const len = r.length + this.logsCtrl.holdValue.length
            if (len > this._ec.numLogs) {
              this._logs$.next([...this.logsCtrl.holdValue.slice(r.length - this._ec.numLogs), ...r].slice(-5))
            } else {
              this._logs$.next([...this.logsCtrl.holdValue, ...r])
            }
          } else {
            this._logs$.next(r)
          }
        },
        err => {
          console.error("日志获取错误", err)
          this.errorHanle(err)
        },
        () => {
          this.logsCtrl.sub.unsubscribe()
          this.logsCtrl.sub = null
          this.logsCtrl.need = true
          this.logsCtrl.holdValue = this._logs$.value
          // this.restartLog()
        }
      )
    }


  }
  private traffic$() {
    return this.http.get(`${this.url}/traffic`, null, { headers: this.headers, observe: "events", reportProgress: true, responseType: 'text' }).pipe(
      filter(event => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            return true
          default:
            return false
        }
      }),
      map(event => {
        // TODO(ts): partialText属性应该关联到对象
        return JSON.parse(`[${event['partialText'].split(/[\n]/).slice(0, -1).join(',')}]`).slice(-1 * this._ec.numTraffic)
      }),
      take(this._ec.numTraffic)
    );
  }

  private logs$() {
    return this.http.get(`${this.url}/logs`, null, { headers: this.headers, observe: "events", reportProgress: true, responseType: 'text' }).pipe(
      filter(event => {
        switch (event.type) {
          case HttpEventType.DownloadProgress:
            return true
          default:
            return false
        }
      }),
      map(event => {
        // TODO(ts): partialText属性应该关联到对象
        return JSON.parse(`[${event['partialText'].split(/[\n]/).slice(0, -1).join(',')}]`).slice(-1 * this._ec.numLogs)
      },
        take(this._ec.numLogs)));
  }

}
