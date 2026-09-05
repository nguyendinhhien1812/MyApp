// Nạp tiền điện thoại: nhà mạng và mệnh giá.
//
// Màu thương hiệu nhà mạng (đỏ Viettel, xanh Vinaphone…) là thuộc tính của chính
// nhà mạng đó, không phải màu giao diện, nên nằm cùng dữ liệu và cố định 2 chế độ.

export type CarrierId = 'viettel' | 'vinaphone' | 'mobifone' | 'gmobile' | 'itelecom';

export type Carrier = {
  id: CarrierId;
  name: string;
  color: string;
  short: string;
};

const CARRIERS: Carrier[] = [
  { id: 'viettel',   name: 'Viettel',   color: '#E89951', short: 'V' },
  { id: 'vinaphone', name: 'Vinaphone', color: '#0077c8', short: 'VP' },
  { id: 'mobifone',  name: 'Mobifone',  color: '#00a651', short: 'MB' },
  { id: 'gmobile',   name: 'Gmobile',   color: '#8b0000', short: 'GT' },
  { id: 'itelecom',  name: 'Itelecom',  color: '#ff6b00', short: 'IT' },
];

const DENOMS = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000];
const POPULAR_DENOM = 50_000;

export const listCarriers = (): Carrier[] => [...CARRIERS];

export const getCarrier = (id: CarrierId): Carrier =>
  CARRIERS.find(c => c.id === id) ?? CARRIERS[0];

export const listDenoms = (): number[] => [...DENOMS];

export const popularDenom = (): number => POPULAR_DENOM;
