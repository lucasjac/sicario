import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class TaskService {

  constructor(private httpClient: HttpClient) { }

  getIpAddress(): Observable<any>
  {
    return this.httpClient.get("https://api.ipify.org/", {responseType: 'text'});
  }
}
