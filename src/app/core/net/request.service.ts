import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

const SERVER = environment.SERVER_URL;
const AUTH = environment.AUTH;

@Injectable({
    providedIn: 'root'
})
export class RequestService {

    constructor(private _http: HttpClient) {
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
        const httpHeaders: HttpHeaders = RequestService.generateHeader;

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
        const httpHeaders: HttpHeaders = RequestService.generateHeader;

        return this._http.post(`${SERVER}${url}`, body, {headers: httpHeaders, params: httpParams});
    }

}
