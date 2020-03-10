import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {_HttpClient} from "@delon/theme";

const SERVER = environment.SERVER_URL;
const AUTH = environment.AUTH;

@Injectable({
    providedIn: 'root'
})
export class MicroAppService {

    constructor(private _http: _HttpClient) {
    }

    get loading() {
        return this._http.loading;
    }

    private static get generateHeader(): HttpHeaders {
        return new HttpHeaders({
            'Access-Control-Allow-Origin': '*',
            'Authorization': AUTH,
            'Content-Type': 'application/json'
        });
    }

    /**
     * GET Method
     *
     * @param url
     * @param params
     */
    public get(url: string, params?: HttpParams): Observable<any> {
        let httpParams = params ? params : new HttpParams();
        const httpHeaders: HttpHeaders = MicroAppService.generateHeader;

        return this._http.get<any>(`${SERVER}${url}`, {headers: httpHeaders, params: httpParams});
    }

    /**
     * POST Method
     *
     * @param url
     * @param body
     * @param params
     */
    public post(url: string, body: any | null, params?: HttpParams): Observable<any> {
        let httpParams = params ? params : new HttpParams();
        const httpHeaders: HttpHeaders = MicroAppService.generateHeader;

        return this._http.post(`${SERVER}${url}`, body, {headers: httpHeaders, params: httpParams});
    }
}
