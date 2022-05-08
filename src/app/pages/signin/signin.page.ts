import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { NotifierService } from 'src/app/services/notifier.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  providers: [TaskService]
})
export class SigninPage implements OnInit, OnDestroy {
  private passwordConf: string = '';
  private usuario: Usuario;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private notifier: NotifierService,
    private task: TaskService)
    { 
      this.cleanUsuario();
    }

  ngOnInit()
  {
    this.task.getIpAddress().pipe(takeUntil(this.unsubscribe$)).subscribe(
      data => this.usuario.ip = data.toString(),
      error => console.log(<any>error));
  }

  async register() {
    if((this.usuario.nombre && this.usuario.email && this.usuario.password && this.passwordConf) && (this.usuario.password == this.passwordConf))
    {
      this.auth.create(this.usuario);
      this.cleanUsuario();
      this.passwordConf = '';
    } else
    {
      let message = 'Todos los campos deben ser completados.';
      if(this.usuario.password != this.passwordConf) message = 'Las contraseñas no coinciden.';
      this.notifier.toast(message, 'top', 'toast-alert');
    }
  }

  ngOnDestroy() 
  { 
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cleanUsuario()
  {
    this.usuario = { id: '', nombre: '', email: '', telefono: '', pais: '', nivel: '', periodo: '', password: '', fecha: '', ip: ''} as Usuario;
  }
}
