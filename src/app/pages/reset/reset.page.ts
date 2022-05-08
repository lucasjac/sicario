import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { NotifierService } from 'src/app/services/notifier.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.page.html',
  styleUrls: ['./reset.page.scss'],
})
export class ResetPage implements OnInit {
  usuario: Usuario;
  
  constructor(
    private auth: AuthService,
    private notifier: NotifierService
    )
    { 
      this.cleanUsuario();
    }

  ngOnInit() { }

  recover()
  {
    if(this.usuario.email)
    {
      this.auth.reset(this.usuario);
      this.cleanUsuario();
    } else
    {
      this.notifier.toast('El correo no fue definido.', 'top', 'toast-alert');
    }
  }

  cleanUsuario()
  {
    this.usuario = { id: '', nombre: '', email: '', telefono: '', pais: '', nivel: '', periodo: '', password: '', fecha: '', ip: ''} as Usuario;
  }
}
