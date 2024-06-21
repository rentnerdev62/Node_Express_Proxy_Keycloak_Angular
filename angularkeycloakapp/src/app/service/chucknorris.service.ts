import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChucknorrisService {

  
    url: string = 'https://api.chucknorris.io/jokes/random'; //?category=dev';
    private http:HttpClient = inject(HttpClient)
    // constructor(private http: HttpClient) {}
  
    getData(): Observable<ApiResponse> {
      return this.http.get<ApiResponse>(this.url); //.retry(3);
    }
  
  
  }
  
  export interface ApiResponse {
    icon_url: string;
    id: string;
    url: string;
    value: string;
  }
