import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { HttpService } from '../api/http.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  artikelnr:any = "";
  show_content:boolean = false;
  filiale:any[] = [];
  articles:any[] = [];
  filiale_filter_list:any = [];
  highlighted_colorname:string;
  highlighted_size:string;
  show_loading:boolean = false;
  highlighted_filiale:any[] = [];
  img:any; 
  pincode:string;

  constructor(platform: Platform,private alertController: AlertController,private router: Router , private http: HttpService,private loadingController: LoadingController) {}

  ionViewWillEnter() {
    if(JSON.parse(localStorage.getItem("filiale_sort")) == null) {
      this.filiale_filter_list = [];
    }else {
      this.filiale_filter_list = JSON.parse(localStorage.getItem("filiale_sort"));
    }

    if(localStorage.getItem("pincode") == "" || localStorage.getItem("pincode") == null){
      this.pincode = "";
    }else {
      this.pincode = localStorage.getItem("pincode")
    }
  }
  // Öffnet eine Confirm box wo man einen PIN Code eingeben muss
  async presentAlert2() {
    const alert = await this.alertController.create({
      header: 'PIN Code eingeben',
      inputs: [
        {
          name: 'pin',
          placeholder: 'PIN CODE',
          type: 'number' 
        }
      ],
      buttons: [{
        text: "OK",
        handler: (data) => {
          if(data.pin == "4101" || data.pin == this.pincode){ //4101 ist der Master PIN Code
            this.router.navigateByUrl("/settings");
          }
          console.log('Cancel clicked'+data.pin);
        }
      }]
    });
    await alert.present();
  }

  scan() {
    // this.barcodeScanner.scan().then(barcodeData => {
    //   console.log('Barcode data', barcodeData);
    //   this.artikelnr = barcodeData.text.substring(0,7);
    //   this.get_artcile();
    //  }).catch(err => {
    //    this.presentAlert("Fehler beim Scannen","",JSON.stringify(err));
    //  });
  }

  pin_code() {
    this.presentAlert2();
  }

  async presentAlert(header:string,subHeader:string,message:string,  ) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  // Zeigt alle Artikel von einer Filiale an
  set_artcile(filiale) {
    if(this.filiale.length != 0){
      let search = this.filiale.filter(el => el.filiale == filiale);
      this.articles = search[0]["articles"];
    
    }

  }

  // erhalten von allen Artikel und Filialen. Mapping erfolgt.
  get_artcile() {
    this.show_content = false;
    this.articles = [];
    this.filiale = [];
    this.highlighted_colorname = "";
    this.highlighted_size = "";
    this.show_loading = true;
    // Überprüft ob Artikel leer ist
    if(this.artikelnr == ""){
      this.presentAlert("Keinen Barcode eingegeben","","Bitte geben Sie einen Barcode ein oder benutzen Sie die scan Funktion! DANKE!");
      this.show_loading = false;
      this.show_content = false;
    }else {
      // 1 Artikel
      this.http.get_articel(this.artikelnr).then((val)=> {
        if("errorMsg" in val["data"]) {  
          this.presentAlert("Ein Fehler ist aufgetreten!","",JSON.stringify(val["data"]));          
        }else {
          this.img = val["data"].image.replace(",base64",";base64");
          this.highlighted_colorname = val["data"]["list"][0].lieffarbe;
          this.highlighted_size =  val["data"]["list"][0].groesse;
          val["data"]["list"].forEach(element => {
            this.highlighted_filiale.push(element.filiale);
          });
          this.http.get_articels(val["data"]["list"][0]["artikelstammnr"]).then((val2)=> {
            val2["data"]["list"].forEach(element => {
              console.log(this.filiale_filter_list)
              if(this.filiale_filter_list.indexOf(element.filiale.toString()) != -1){
                let initElement = {
                  sizes : [{
                    name : element.groesse,
                    sort: element.staffellink,
                    stock: element.stock,
                    sold: element.sold
                  }],
                  "colorname" : element.lieffarbe ,
                  "artikelstammnr" : element.artikelstammnr
                };
                if(this.filiale.length == 0){ //init Push
                  this.filiale.push({"filiale" : element.filiale,"articles" : [initElement]})
                }else {
                  //Suche ob es die Filiale bereits gitb
                  let search = this.filiale.filter(el => el.filiale == element.filiale); 
                  if(search.length == 0){ //Bei Nein pushe sie ins Array
                    this.filiale.push({"filiale" : element.filiale,"articles" : [initElement]})
                  }else { //Bei Ja Fitlere die Artikel
                    if(search[0]["articles"].length == 0){
                      search[0]["articles"].push(initElement)
                    }else {
                      let search_article = search[0]["articles"].filter(el => el.colorname == element.lieffarbe);
                      if(search_article.length == 0){
                        search[0]["articles"].push(initElement)
                      }else {
                        search_article[0].sizes.push({
                          name : element.groesse,
                          sort: element.staffellink,
                          stock: element.stock,
                          sold: element.sold
                        })
                      }              
                    }
                  }
                }
              }      
            });
            if(this.filiale_filter_list.length != 0) {
              this.set_artcile(this.filiale_filter_list[0]);
            }
            this.show_content = true;
            this.show_loading = false;
          })
        }
      }).catch((err)=> {
        this.presentAlert("Es ist ein Fehler aufgetreten!","",JSON.stringify(err));
        this.show_content = false;
        this.show_loading = false;
      })
    }
  }

}
