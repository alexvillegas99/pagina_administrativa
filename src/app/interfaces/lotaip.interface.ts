import { Timestamp } from 'firebase/firestore';

export interface LotaipDocument {
  uid?: string;
  name: string;
  creationDate?: Timestamp;
  category?: LotaipCategory[];
}

export interface LotaipCategory {
  uid?: string;
  name: string;
  creationDate?: Timestamp;
  items?: LotaipItem[];
}

export interface LotaipItem {
  uid?: string;
  name: string;
  urlPDF: string;
  creationDate?: Timestamp;
}
