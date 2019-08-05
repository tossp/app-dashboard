export interface IApiInfo {
  host: string
  port: number
  secret?: string
  numLogs?: number
  numTraffic?: number
}

export interface IConfig {
  "allow-lan"?: boolean;
  "log-level"?: string;
  "redir-port"?: number;
  "socks-port"?: number;
  mode?: string;
  port?: number;
}

// https://github.com/Dreamacro/clash/blob/dev/constant/rule.go
export enum RuleType {
  'Domain' = 'Domain',
  'DomainSuffix' = 'DomainSuffix',
  'DomainKeyword' = 'DomainKeyword',
  'GEOIP' = 'GEOIP',
  "IPCIDR" = "IPCIDR",
  'SrcIPCIDR' = 'SrcIPCIDR',
  'SrcPort' = 'SrcPort',
  'DstPort' = 'DstPort',
  'MATCH' = 'MATCH',
  "Unknow" = "Unknow"
}

// https://github.com/Dreamacro/clash/blob/dev/constant/adapters.go
export enum AdapterType {
  'Direct' = 'Direct',
  'Fallback' = 'Fallback',
  'Reject' = 'Reject',
  'Selector' = 'Selector',
  "Shadowsocks" = "Shadowsocks",
  'Socks5' = 'Socks5',
  'Http' = 'Http',
  'URLTest' = 'URLTest',
  'Vmess' = 'Vmess',
  'LoadBalance' = 'LoadBalance',
  "Unknow" = "Unknow"
}


// https://github.com/Dreamacro/clash/blob/dev/constant/traffic.go
export interface ITraffic {
  up?: number;
  down?: number;
  upCount?: number;
  downCount?: number;
  upTotal?: number;
  downTotal?: number;
  x?: number;
  y1?: number;
  y2?: number;
}

export interface ILogs {
  type?: string;
  payload?: string;
}

export interface IRule {
  type?: RuleType
  payload?: string
  proxy?: string   // proxy or proxy group name
  payloads?: string[]
}

export interface IRules {
  rules: IRule[]
}

// https://github.com/Dreamacro/clash/blob/dev/constant/adapters.go
export interface IHistory {
  time: string;  // proxy or proxy group name
  delay: number;
}


export interface IProxies {
  proxies?: IProxy;  // proxy or proxy group name
}

export interface IProxy {
  [name: string]: IAdaptersProxy | IGroupProxy | IDirectProxy | IRejectProxy | IUnknowProxy;  // proxy or proxy group name
}

// https://github.com/Dreamacro/clash/blob/dev/adapters/outbound/base.go MarshalJSON
export interface IBaseProxy {
  history: IHistory[];
}

export interface IDirectProxy extends IBaseProxy {
  type: AdapterType.Direct;
}
export interface IRejectProxy extends IBaseProxy {
  type: AdapterType.Reject;
}
export interface IUnknowProxy extends IBaseProxy {
  type: AdapterType.Unknow;
}

export interface IGroupProxy extends IBaseProxy {
  type: AdapterType.Fallback | AdapterType.LoadBalance | AdapterType.Selector | AdapterType.URLTest
}

export interface IGroupProxyFallback extends IGroupProxy {
  type: AdapterType.Fallback;
  now: string;
  all: string[];
}
export interface IGroupProxyLoadBalance extends IGroupProxy {
  type: AdapterType.LoadBalance;
  all: string[];
}
export interface IGroupProxySelector extends IGroupProxy {
  type: AdapterType.Selector;
  now: string;
  all: string[];
}
export interface IGroupProxyURLTest extends IGroupProxy {
  type: AdapterType.URLTest;
  now: string;
  all: string[];
}

export interface IAdaptersProxy extends IBaseProxy {
  type: AdapterType.Vmess | AdapterType.Socks5 | AdapterType.Shadowsocks | AdapterType.Http | AdapterType.Direct | AdapterType.Reject
}

