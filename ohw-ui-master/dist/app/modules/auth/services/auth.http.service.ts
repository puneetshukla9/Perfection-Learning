import { Http, Headers, Request, Response, IRequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { EmitterService } from './auth.emitter.ts';

@Injectable()
export class AuthHttp {

    constructor(
      public EmitterService: EmitterService,
      public http: Http,
    ) {
      var headers = new Headers();
      this.config = this.createHeaders(headers);
    }

    createHeaders(headers: Headers) {
      headers.append('Content-Type', 'application/json');
      let config = { withCredentials: true, headers: headers };
      return config;
    }

    // make an exception for CORS handling in code service
    get(url, credentialsOff) {
      var config = {};
      if (credentialsOff) {
        var config = _.extend({}, this.config);
        config.withCredentials = false;
      } else {
        config = this.config;
      }
      EmitterService.get('spinner').emit(true);
      return this.http.get(url, config)
        .map((res: Response) => res.json())
        .finally(() => { EmitterService.get('spinner').emit(false); });
    }

    post(url, payload) {
      EmitterService.get('spinner').emit(true);
      return this.http.post(url, payload, this.config)
        .map((res: Response) => res.json())
        .finally(() => { EmitterService.get('spinner').emit(false); });
    }

    put(url, payload) {
      EmitterService.get('spinner').emit(true);
      return this.http.put(url, payload, this.config)
        .map((res: Response) => res.json())
        .finally(() => { EmitterService.get('spinner').emit(false); });
    }

    patch(url, data) {
      EmitterService.get('spinner').emit(true);
      return this.http.patch(url, payload, this.config)
        .map((res: Response) => res.json())
        .finally(() => { EmitterService.get('spinner').emit(false); });
    }

    del(url) {
      EmitterService.get('spinner').emit(true);
      return this.http.del(url, this.config)
        .map((res: Response) => res.json())
        .finally(() => { EmitterService.get('spinner').emit(false); });
    }

};
