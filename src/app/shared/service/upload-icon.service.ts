import {Injectable} from '@angular/core';
import {NzMessageService, UploadChangeParam, UploadFile, UploadXHRArgs} from "ng-zorro-antd";
import {Subscription} from "rxjs";
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse} from "@angular/common/http";
import {environment} from "@env/environment";

@Injectable({
    providedIn: 'root'
})
export class UploadIconService {

    private _maxUploadLimit: number = 1;
    private _iconList: string[] = [];

    constructor(
        private http: HttpClient,
        private msg: NzMessageService
    ) {
    }

    get maxUploadLimit(): number {
        return this._maxUploadLimit;
    }

    set maxUploadLimit(value: number) {
        this._maxUploadLimit = value;
    }

    get iconList(): string[] {
        return this._iconList;
    }

    public isReachLimit(): boolean {
        return this._iconList.length >= this._maxUploadLimit;
    }

    public emptyIconList() {
        this._iconList = [];
    }

    public addIcon(icon: string) {
        this._iconList.push(icon)
    }

    public handleBeforeUpload(file: UploadFile, fileList: UploadFile[]): boolean {
        let isJPG = false;
        ['image/png', 'image/jpeg', 'image/gif', 'image/jpg'].forEach((item) => {
            if (item == file.type) {
                isJPG = true;
            }
        });
        if (!isJPG) {
            this.msg.error('目前只支持选择JPG/PNG/GIF/JPEG!');
            return false;
        }
        if (this.isReachLimit()) {
            this.msg.error(`最多上传${this.maxUploadLimit}张图片, 请先删除已有的图片!`);
            return false;
        }
        return true;
    }

    public uploadImage(item: UploadXHRArgs): Subscription {
        // Create a FormData here to store files and other parameters.
        const formData = new FormData();
        // tslint:disable-next-line:no-any
        formData.append('file', item.file as any);
        const httpHeaders = new HttpHeaders({
            'Authorization': environment.AUTH,
        });

        const req = new HttpRequest('POST', item.action!, formData, {
            headers: httpHeaders,
            reportProgress: true,
            withCredentials: true
        });

        return this.http.request(req).subscribe(
            // tslint:disable-next-line no-any
            (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress) {
                    if (event.total! > 0) {
                        // tslint:disable-next-line:no-any
                        (event as any).percent = (event.loaded / event.total!) * 100;
                    }
                    item.onProgress!(event, item.file!);
                } else if (event instanceof HttpResponse) {
                    item.onSuccess!(event.body, item.file!, event);
                }
            },
            err => {
                item.onError!(err, item.file!);
            }
        );
    }

    public handleUploadSuccess(args: UploadChangeParam) {
        if (args.type == 'success') {
            this.addIcon(args.file.response.url);
            args.fileList[0].url = environment.SERVER_URL + '/static/upload/' + args.file.response.url;
            // args.fileList[0].url = args.file.response.url;
        }
    }

    public handleDeleteIcon(file: UploadFile): boolean{
        this._iconList = this._iconList.filter( (item) => {
            return file.url.indexOf(item) == -1;
        } );
        return true;
    }
}
