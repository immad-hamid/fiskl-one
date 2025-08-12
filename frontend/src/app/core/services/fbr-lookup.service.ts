import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ProvinceRaw = { stateProvinceCode: number; stateProvinceDesc: string };
type TransTypeRaw = { transactioN_TYPE_ID: number; transactioN_DESC: string };
type HsCodeRaw = { hS_CODE: string; description: string };
type UomRaw = { uoM_ID: number; description: string };

type SaleTypeRateRaw = {
  ratE_ID: number;
  ratE_DESC: string;
  ratE_VALUE: number;
};
type SroScheduleRaw = { srO_ID: number; serNo: number; srO_DESC: string };
type SroItemRaw = { srO_ITEM_ID: number; srO_ITEM_DESC: string };

@Injectable({ providedIn: 'root' })
export class FbrLookupService {
  private base = '/fbr';

  // Set default Authorization header
  private headers = new HttpHeaders({
    Authorization: `Bearer ${environment.token}`,
  });

  constructor(private http: HttpClient) {}

  /** Provinces (server-side cached) */
  getProvinces(): Observable<{ code: number; description: string }[]> {
    return this.http.get<{ code: number; description: string }[]>(
      `${this.base}/provinces`,
      {
        headers: this.headers,
      }
    );
  }

  /** Transaction types (server-side cached) -> normalized { id, description } */
  getTransactionTypes(): Observable<{ id: number; description: string }[]> {
    return this.http.get<{ id: number; description: string }[]>(
      `${this.base}/transtypes`,
      { headers: this.headers }
    );
  }

  /** HS Codes */
  getHsCodes(): Observable<{ hsCode: string; description: string }[]> {
    return this.http.get<{ hsCode: string; description: string }[]>(
      `${this.base}/itemdescs`,
      { headers: this.headers }
    );
  }

  /** Units of Measure */
  getUoms(): Observable<{ id: number; name: string }[]> {
    return this.http
      .get<UomRaw[]>(`${this.base}/uoms`, { headers: this.headers })
      .pipe(
        map((rows) =>
          rows.map((r) => ({
            id: r.uoM_ID,
            name: r.description,
          }))
        )
      );
  }

  /** SaleTypeToRate */
  getSaleTypeToRate(
    transTypeId: number,
    originationSupplier: number,
    date?: string
  ) {
    let params = new HttpParams()
      .set('transTypeId', String(transTypeId))
      .set('originationSupplier', String(originationSupplier));
    if (date) params = params.set('date', date);

    return this.http.get<SaleTypeRateRaw[]>(`${this.base}/saletype-rate`, {
      headers: this.headers,
      params,
    });
  }

  /** SRO Schedule */
  getSroSchedule(
    rateId: number,
    originationSupplierCsv: number | string,
    date?: string
  ) {
    let params = new HttpParams()
      .set('rate_id', String(rateId))
      .set('origination_supplier_csv', String(originationSupplierCsv));
    if (date) params = params.set('date', date);

    return this.http.get<SroScheduleRaw[]>(`${this.base}/sro-schedule`, {
      headers: this.headers,
      params,
    });
  }

  /** SRO Items */
  getSroItems(sroId: number, date?: string) {
    let params = new HttpParams().set('sro_id', String(sroId));
    if (date) params = params.set('date', date);

    return this.http.get<SroItemRaw[]>(`${this.base}/sro-item`, {
      headers: this.headers,
      params,
    });
  }
}
