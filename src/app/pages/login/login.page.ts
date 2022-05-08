import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { NotifierService } from 'src/app/services/notifier.service';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  providers: [TaskService]
})
export class LoginPage implements OnInit, OnDestroy {
  usuario: Usuario;
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

  login() {
    if(this.usuario.email && this.usuario.password)
    {
      console.log('Dirección IP: ' + this.usuario.ip);
      this.auth.signIn(this.usuario);
      this.cleanUsuario();
    } else
    {
      this.notifier.toast('Todos los campos deben ser completados.', 'top', 'toast-alert');
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
