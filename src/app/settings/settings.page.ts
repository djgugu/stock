import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonReorderGroup, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  @ViewChild(IonReorderGroup,{static: true}) reorderGroup: IonReorderGroup;
  performupdate:boolean = false;
  downloadProgress:number;
  downloadText:string;
  button_text:string;
  filialen = [];
  constructor(private alertController: AlertController,public loadingCtrl: LoadingController,private alertCtrl: AlertController) {
    if(localStorage.getItem("pincode") == "" || localStorage.getItem("pincode") == null){
      this.button_text = "PIN Code festlegen";
    }else {
      this.button_text = "PIN Code ändern"
    }
   }


   ionViewWillLeave() {
    localStorage.setItem("filiale_sort",JSON.stringify(this.filialen));
   }

   ionViewDidEnter() {
    if(JSON.parse(localStorage.getItem("filiale_sort")) == null) {
      this.filialen = [];
    }else {
      this.filialen = JSON.parse(localStorage.getItem("filiale_sort"));
    }
   }
   async insert_filiale_popup() {
     const alert = await this.alertController.create({
       header: 'Filiale hinzufügen',
       inputs: [
        {
          name: 'filiale',
          placeholder: 'Filiale',
          type: 'number' // here the error
        }
      ],
       buttons: [
         {
           text: 'Abbrechen',
           role: 'cancel',
           cssClass: 'secondary',
           handler: () => {
             console.log('Confirm Cancel: blah');
           }
         }, {
           text: 'Hinzufügen',
           handler: (data) => {
             this.filialen.push(data.filiale);
             console.log('Confirm Okay'+data.filiale);
           }
         }
       ]
     });
   
     await alert.present();
   }

   
   
   delete_filiale(f) {
     
    this.filialen.splice(this.filialen.indexOf(f),1);

   }
   doReorder(ev: any) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete(this.filialen);
    
  }

  toggleReorderGroup() {
    this.reorderGroup.disabled = !this.reorderGroup.disabled;
  }



  ngOnInit() {
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'PIN Code muss 4 Zeichen lang sein',
      buttons: ['OK']
    });
  
    await alert.present();
  }
  async presentAlert2(header, message) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
  
    await alert.present();
  }
  async pincode() {
    const alert = await this.alertController.create({
      header: 'PIN Code eingeben',
      message: 'Bitte einen PIN Code festlegen',
      inputs: [
        {
          name: 'pin',
          placeholder: 'PIN CODE',
          value: "",
          type: 'number' // here the error
        }
      ],
      buttons: [
      {
        text: 'Abbrechen',
        role: 'cancel',
        handler: () => {
          console.log('Confirm Ok');
        }
      },{
        text: "OK",
        handler: (data) => {
          if(data.pin.length == 4){
            localStorage.setItem("pincode",data.pin);
          }else {
            this.presentAlert();
          }
          
       
        }
      }]
    });
  
    await alert.present();
  }

  set_pincode() {
    this.pincode();
  }
}
