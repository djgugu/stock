import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(public httpClient: HttpClient) { }
  
  get_articel(artikelnr) {
    return new Promise((resolve, reject) => {
      this.httpClient.get("https://192.168.10.8:2000/getStock/"+artikelnr).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }

  get_articels(artikelstammnr) {
    return new Promise((resolve, reject) => {
      this.httpClient.get("https://192.168.10.8:2000/getStocks/"+artikelstammnr).subscribe(res => {
        resolve(res);
      }, err => {
        reject(err);
      });
    });
  }
}
