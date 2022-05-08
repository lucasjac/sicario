import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import * as firebase from 'firebase';
import { NotifierService } from './notifier.service';
import { DateService } from './date.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable()
export class AuthService{
  usuario$: Observable<Usuario>;
  usuario: Usuario;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fireauth: AngularFireAuth,
    private firestr: AngularFirestore,
    private router: Router,
    private notifier: NotifierService,
    private date: DateService)
  {
    this.usuario$ = this.fireauth.authState.pipe(takeUntil(this.unsubscribe$)).pipe(switchMap(user => {
      if(user)
      {
        return this.firestr.doc<Usuario>(`usuarios/${user.uid}`).valueChanges();
      } else
      {
        return of(null);
      }
    }));
  }

  async create(usuario: Usuario)
  {
    const loading = await this.notifier.loading('Registrando...');
    loading.present();
    let date = new Date();
    this.fireauth.createUserWithEmailAndPassword(usuario.email, usuario.password).then(res => {
      res.user.sendEmailVerification();
      this.firestr.collection('usuarios').doc(res.user.uid).set({
          'id': res.user.uid,
          'nombre': usuario.nombre,
          'email': usuario.email,
          'fecha': this.date.getDate(date),
          'ip': usuario.ip
        });
      }).then(() => {
        loading.dismiss();
        this.notifier.toast('Registrado con éxito! Verifique su email.', 'top', 'toast-success');
        this.router.navigate(['/login']);
      }).catch(error => {
        loading.dismiss();
        this.notifier.toast(error.message, 'toast', 'toast-alert');
      });
  }

  async signIn(usuario: Usuario)
  {
    const loading = await this.notifier.loading('Ingresando...');
    loading.present();
    this.fireauth.setPersistence(firebase.default.auth.Auth.Persistence.LOCAL).then(() => {
      this.fireauth.signInWithEmailAndPassword(usuario.email, usuario.password).then((data) => {
        loading.dismiss();
        if(!data.user.emailVerified)
        {
          this.notifier.toast('Tu correo no está verificado.', 'top', 'toast-alert');
          this.fireauth.signOut();
        } else
        {
          this.router.navigate(['/home']);
          this.firestr.collection('usuarios').doc(data.user.uid).set({ 'ip': usuario.ip }, {merge: true});
        }
      }).catch(error => {
        loading.dismiss();
        this.notifier.toast(error.message, 'toast', 'toast-alert');
      }).catch(error => {
        loading.dismiss();
        this.notifier.toast(error.message, 'toast', 'toast-alert');
      });
    });
  }

  async reset(usuario: Usuario)
  {
    const loading = await this.notifier.loading('');
    loading.present();
    this.fireauth.sendPasswordResetEmail(usuario.email).then(data => {
        loading.dismiss();
        this.notifier.toast('El link de recuperación ha sido enviado a tu dirección de correo electrónico.', 'top', 'toast-success');
        this.router.navigateByUrl('/login');
      }).catch(error => {
        loading.dismiss();
        this.notifier.toast(error.message, 'top', 'toast-alert');
      });
  }

  async signOut()
  {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    const loading = await this.notifier.loading('');
    loading.present();
    this.fireauth.signOut().then(() => {
      loading.dismiss();
      this.router.navigate(['/login']);
    });
  }
}
