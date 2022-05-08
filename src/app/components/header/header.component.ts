import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit{
  usuario: Usuario;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private menu: MenuController,
    private auth: AuthService,
    private router: Router,
    public feedback: FeedbackService)
    {
      this.usuario = { id: '', nombre: '', email: '', password: '', fecha: '', ip: ''} as Usuario;
    }

  ngOnInit()
  {
    this.auth.usuario$.pipe(takeUntil(this.unsubscribe$)).subscribe(user => this.usuario = user);
  }

  buttonBack()
  {
    this.feedback.changeMode([false, false]);
    this.feedback.sendClickBack();
  }

  buttonMenu()
  {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  buttonSearch()
  {
    this.feedback.changeMode([false, true]);
  }

  buttonPlus()
  {
    this.feedback.changeMode([true, false]);
  }

  logOut()
  {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.auth.signOut();
  }
}
