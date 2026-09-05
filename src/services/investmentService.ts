// Đầu tư: danh mục, bảng giá, tỷ giá. Đây là service DUY NHẤT gọi mạng thật,
// nên cũng là service duy nhất bất đồng bộ.
//
// Quy ước xử lý lỗi: service ném lỗi, KHÔNG tự nuốt. Màn hình mới là nơi biết
// nên hiện banner "Thử lại" hay lặng lẽ dùng dữ liệu mẫu.

import { logger } from '../utils/logger';

export type MarketTab = 'HOSE' | 'HNX' | 'gold' | 'fund';

export type Stock = {
  id: string;
  ticker: string;
  name: string;
  vol: string;
  price: number;
  change: number;
  trend: 'up' | 'down';
  sparkData: number[];
};

export type Rates = {
  usdVnd: number;
  eurVnd: number;
  goldPerGram: number;
  updatedAt: string;
};

const RATES_API =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json';

const STOCK_API =
  'https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/ticker-list?tickers=VNM,VIC,FPT,VCB,TCB,HPG,MBB,BID,CTG,ACB';

// Tên công ty là dữ liệu, không phải nhãn giao diện — không dịch.
const TICKER_NAMES: Record<string, string> = {
  VNM: 'Vinamilk', VIC: 'Vingroup', FPT: 'FPT Corp',
  VCB: 'Vietcombank', TCB: 'Techcombank', HPG: 'Hoà Phát',
  MBB: 'MB Bank', BID: 'BIDV', CTG: 'VietinBank', ACB: 'ACB Bank',
  MWG: 'Thế Giới Di Động',
};

/** Sparkline giả lập nhưng tất định: cùng mã + cùng xu hướng luôn ra cùng hình. */
export const makeSparkData = (ticker: string, trend: 'up' | 'down'): number[] => {
  const hash = ticker.split('').reduce((s, c, i) => s + c.charCodeAt(0) * (i + 3), 0);
  return Array.from({ length: 7 }, (_, i) => {
    const noise = ((hash * (i + 7) * 13) % 10) - 5;
    const trendOff = trend === 'up' ? i * 3 : -i * 3;
    return Math.max(4, 22 + noise + trendOff);
  });
};

const STOCKS: Record<MarketTab, Stock[]> = {
  HOSE: [
    { id: 'VCB', ticker: 'VCB', name: 'Vietcombank',      vol: '4.2M', price: 89500,  change: 1.24,  trend: 'up',   sparkData: makeSparkData('VCB', 'up') },
    { id: 'FPT', ticker: 'FPT', name: 'FPT Corp',         vol: '2.8M', price: 125200, change: -0.87, trend: 'down', sparkData: makeSparkData('FPT', 'down') },
    { id: 'HPG', ticker: 'HPG', name: 'Hoà Phát',         vol: '9.1M', price: 27800,  change: 2.58,  trend: 'up',   sparkData: makeSparkData('HPG', 'up') },
    { id: 'VIC', ticker: 'VIC', name: 'Vingroup',         vol: '3.5M', price: 45600,  change: -0.44, trend: 'down', sparkData: makeSparkData('VIC', 'down') },
    { id: 'MWG', ticker: 'MWG', name: 'Thế Giới Di Động', vol: '1.9M', price: 62300,  change: 1.77,  trend: 'up',   sparkData: makeSparkData('MWG', 'up') },
  ],
  HNX: [
    { id: 'SHB', ticker: 'SHB', name: 'Saigon Hanoi Bank', vol: '8.4M', price: 14200, change: 0.71,  trend: 'up',   sparkData: makeSparkData('SHB', 'up') },
    { id: 'PVS', ticker: 'PVS', name: 'PTSC',              vol: '5.2M', price: 35100, change: -1.12, trend: 'down', sparkData: makeSparkData('PVS', 'down') },
    { id: 'VCS', ticker: 'VCS', name: 'Vicostone',         vol: '0.8M', price: 78900, change: 0.38,  trend: 'up',   sparkData: makeSparkData('VCS', 'up') },
  ],
  gold: [
    { id: 'SJC', ticker: 'SJC', name: 'Vàng SJC',      vol: '', price: 108_500_000, change: 0.46,  trend: 'up',   sparkData: makeSparkData('SJC', 'up') },
    { id: '999', ticker: '24K', name: 'Vàng 24K nhẫn', vol: '', price: 105_200_000, change: -0.22, trend: 'down', sparkData: makeSparkData('24K', 'down') },
  ],
  fund: [
    { id: 'FUEVFVND', ticker: 'VN Diamond', name: 'ETF VN Diamond', vol: '12.5M', price: 18700, change: 1.08, trend: 'up', sparkData: makeSparkData('FUEVFVND', 'up') },
    { id: 'E1VFVN30', ticker: 'VN30 ETF',   name: 'ETF VN30',       vol: '7.8M',  price: 14200, change: 0.85, trend: 'up', sparkData: makeSparkData('E1VFVN30', 'up') },
  ],
};

const PORTFOLIO_SERIES = [18, 22, 28, 32, 30, 38, 42, 46, 44, 50, 52, 56];

export const listStocks = (tab: MarketTab): Stock[] => STOCKS[tab];

export const getPortfolioSeries = (): number[] => [...PORTFOLIO_SERIES];

const fmtTime = () =>
  new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const parseTCBSItem = (raw: any): Stock | null => {
  try {
    const ticker: string = raw?.ticker || raw?.symbol || raw?.code || '';
    if (!ticker) { return null; }

    // TCBS báo giá theo nghìn đồng (125.5 → 125.500đ)
    const rawPrice: number =
      raw?.lastPrice ?? raw?.price ?? raw?.closePrice ?? raw?.refPrice ?? raw?.avgPrice ?? 0;
    if (!rawPrice || rawPrice <= 0) { return null; }

    const changeRaw: number =
      raw?.pctChange ?? raw?.percentChange ?? raw?.priceChangePercent ?? raw?.changePercent ?? 0;
    const change = Number(Number(changeRaw).toFixed(2));
    const trend: 'up' | 'down' = change >= 0 ? 'up' : 'down';

    const volRaw: number =
      raw?.tradingVol ?? raw?.volume ?? raw?.matchedVol ?? raw?.totalVol ?? 0;
    const vol = volRaw > 0
      ? volRaw >= 1_000_000
        ? `${(volRaw / 1_000_000).toFixed(1)}M`
        : `${(volRaw / 1_000).toFixed(0)}K`
      : '';

    return {
      id: ticker,
      ticker,
      name: TICKER_NAMES[ticker] ?? ticker,
      vol,
      price: Math.round(rawPrice * 1000),
      change,
      trend,
      sparkData: makeSparkData(ticker, trend),
    };
  } catch (err) {
    // Một mã hỏng thì bỏ mã đó, không làm sập cả danh sách
    logger.warn('invest', 'không parse được dữ liệu 1 mã cổ phiếu', err);
    return null;
  }
};

/** Ném lỗi nếu không lấy được — màn hình quyết định hiện gì. */
export const fetchRates = async (): Promise<Rates> => {
  const res = await fetch(RATES_API);
  if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
  const json = await res.json();
  const r = json?.usd;
  if (!r?.vnd || !r?.eur || !r?.xau) { throw new Error('Invalid shape'); }

  const usdVnd = r.vnd as number;
  const xauUsd = 1 / (r.xau as number); // USD mỗi troy ounce
  return {
    usdVnd: Math.round(usdVnd),
    eurVnd: Math.round(usdVnd / (r.eur as number)),
    goldPerGram: Math.round((xauUsd * usdVnd) / 31.1035),
    updatedAt: fmtTime(),
  };
};

/** Giá cổ phiếu sàn HOSE theo thời gian thực. Ném lỗi nếu không dùng được. */
export const fetchLiveHOSE = async (): Promise<Stock[]> => {
  const res = await fetch(STOCK_API, { headers: { Accept: 'application/json' } });
  if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
  const json = await res.json();
  const arr: any[] = json?.data || json?.listStock || json?.stocks || [];
  if (!Array.isArray(arr) || arr.length === 0) { throw new Error('Empty'); }
  const parsed = arr.map(parseTCBSItem).filter(Boolean) as Stock[];
  if (parsed.length === 0) { throw new Error('Parse failed'); }
  return parsed;
};
