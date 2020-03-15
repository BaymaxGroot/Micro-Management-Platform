import {Inject, Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {HttpHeaders, HttpParams, HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Interface} from "../../lib/enums/interface.enum";
import {DA_SERVICE_TOKEN, ITokenService} from "@delon/auth";

const SERVER = environment.SERVER_URL;
const AUTH = environment.AUTH;

@Injectable({
    providedIn: 'root'
})
export class MicroAppService {


    constructor(private _http: HttpClient, @Inject(DA_SERVICE_TOKEN) private _tokenService: ITokenService) {
    }

    public generateHeader(url: string): HttpHeaders {
        let headers;
        if (url.indexOf(Interface.LoginEndPoint) == -1) {
            const token = JSON.parse(window.atob(this._tokenService.get().token)).token;
            const user = JSON.parse(window.atob(this._tokenService.get().token)).user;
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Authorization': AUTH,
                'Content-Type': 'application/json',
                'Account': user,
                'Token': token
            };
        } else {
            headers = {
                'Access-Control-Allow-Origin': '*',
                'Authorization': AUTH,
                'Content-Type': 'application/json'
            };
        }
        const httpHeaders: HttpHeaders = new HttpHeaders(headers);
        return httpHeaders;
    }

    /**
     * GET Method
     *
     * @param url
     * @param params
     */
    public get(url: string, params?: HttpParams): Observable<any> {
        let httpParams = params ? params : new HttpParams();
        let httpHeaders: HttpHeaders = this.generateHeader(url);
        return this._http.get<any>(`${SERVER}/api${url}`, {headers: httpHeaders, params: httpParams});
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
        const httpHeaders: HttpHeaders = this.generateHeader(url);
        return this._http.post(`${SERVER}/api${url}`, body, {headers: httpHeaders, params: httpParams});
    }
}
