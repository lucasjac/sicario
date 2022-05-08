import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NotifierService {

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) { }

  async toast(message, position, status)
  {
    const toast = await this.toastCtrl.create({
      message: message,
      cssClass: status,
      position: position,
      duration: 2000
    });
    toast.present();
  }

  async loading(message)
  {
    const loading = await this.loadingCtrl.create({
      message: message,
      spinner: 'crescent',
      showBackdrop: true
    });
    return loading;
  }
}
