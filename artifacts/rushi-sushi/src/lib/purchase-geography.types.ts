export interface PurchaseLocation {
  municipality_id: number | null;
  city: string | null;
  region: string | null;
  region_code: string | null;
  lat: number | null;
  lng: number | null;
}

export interface PurchaseCity {
  id: string;
  city: string;
  region: string;
  region_code: string;
  lat: number;
  lng: number;
  count: number;
}

export interface PurchaseGeography {
  total: number;
  unmapped: number;
  cities: PurchaseCity[];
  states: { code: string; name: string; count: number }[];
}
