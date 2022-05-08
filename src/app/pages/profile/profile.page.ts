import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Usuario } from 'src/app/models/usuario';
import { Paises } from 'src/app/models/paises';
import { AuthService } from 'src/app/services/auth.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NotifierService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  usuario: Usuario;
  clickBack: Subscription;
  countries : any[];
  
  constructor(
    private firestoreService: FirestoreService,
    private auth: AuthService,
    private notifier: NotifierService,
    private loadingctrl: LoadingController,
    private router: Router,
    public feedback: FeedbackService) 
    {
      this.countries = Paises;
      this.usuario = { id: '', nombre: '', email: '', telefono: '', pais: '', nivel: '', periodo: '', password: '', fecha: '', ip: ''} as Usuario;
      this.clickBack = this.feedback.getClickBack().subscribe(() => {
        this.getBack();
      });
    }

  ngOnInit() {
    this.feedback.changeMode([false, false]);
    this.auth.usuario$.subscribe(user => {
      this.usuario = user;
    });
  }

  async saveUser()
  {
    const loading = await this.loadingctrl.create({
      message: 'Guardando...',
      spinner: 'crescent',
      showBackdrop: true
    });
    loading.present();
    if(this.usuario.nombre != '')
    {
      this.firestoreService.update('usuarios', this.usuario.id, this.usuario).then(() => {
        loading.dismiss();
        this.notifier.toast('Usuario modificado con éxito!', 'middle', 'toast-success');
        this.router.navigate(['/home']);
        this.feedback.changeMode([false, false]);
      }).catch(error => {
        loading.dismiss();
        this.notifier.toast(error.message, 'middle', 'toast-alert');
      });
    } else 
    {
      loading.dismiss();
      this.notifier.toast('El nombre es obligatorio.', 'middle', 'toast-alert');
    }
  }

  getBack()
  {
    this.router.navigate(['/home']);
  }
}
