export interface ActiveSessionDto {
  id: number;
  deviceid: string;
  ipadress: string | null;
  useragent: string | null;
  expiresat: Date;
}

export interface SellerActiveSessionDto {
  id: number;
  deviceid: string;
  ipadress: string | null;
  selleragent: string | null;
  expiresat: Date;
}
