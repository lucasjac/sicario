import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Profesor } from 'src/app/models/profesor';
import { NotifierService } from 'src/app/services/notifier.service';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.page.html',
  styleUrls: ['./teachers.page.scss'],
})
export class TeachersPage implements OnInit, OnDestroy {
  private profesor: Profesor;
  private profesoresFirst: Profesor[];
  private profesores: Profesor[];
  private cantidad: number;
  private filter: string = '';
  clickBack: Subscription;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    public feedback: FeedbackService,
    private notifier: NotifierService)
  {
    this.profesores = [];
    this.cleanProfesor();
    this.clickBack = this.feedback.getClickBack().pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.cleanProfesor();
      this.getProfesores();
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).pipe(takeUntil(this.unsubscribe$)).subscribe(() =>{
      this.checkEmpty(2, true);
    });
  }
  
  ngOnInit() {
    this.getProfesores();
  }

  getProfesores()
  {
    if(this.feedback.pageMode[0] || this.feedback.pageMode[1])
      this.listMode();
    this.cleanProfesor();
    this.firestoreService.getList('profesores').subscribe((result) => {
      this.profesoresFirst = [];
      this.cantidad = 0;
      result.forEach((datos: any) => {
        let profesor = {id: datos.payload.doc.id, nombre: datos.payload.doc.data().nombre, 
          numero: datos.payload.doc.data().numero, correo: datos.payload.doc.data().correo} as Profesor;
        this.profesoresFirst.push(profesor);
        this.cantidad++;
      })
      this.profesores = this.profesoresFirst;
    });
  }

  viewProfesor(profesor: Profesor)
  {
    this.profesor = {id: profesor.id, nombre: profesor.nombre, numero: profesor.numero, correo: profesor.correo} as Profesor;
    this.feedback.changeMode([true, false]);
  }

  async clickSave()
  {
    if(this.profesor.nombre != '')
    {
      const loading = await this.notifier.loading('Guardando...');
      loading.present();
      if(this.profesor.id)
      {
        this.firestoreService.update('profesores', this.profesor.id, this.profesor).then(() => this.getProfesores());
      } else
      {
        this.firestoreService.create("profesores", this.profesor).then(() => {
          this.getProfesores();
        }, (error) => {
          console.error[error];
        });
      }
      loading.dismiss();
      this.notifier.toast('El profesor se ha guardado exitosamente.', 'middle', 'toast-success');
    } else 
    {
      this.notifier.toast('El nombre no debe estar vacío.', 'middle', 'toast-alert');
    }
  }

  async clickDelete()
  {
    const loading = await this.notifier.loading('Eliminando...');
    loading.present();
    this.firestoreService.delete('profesores', this.profesor.id).then(() => this.getProfesores());
    loading.dismiss();
    this.notifier.toast('El profesor se ha eliminado exitosamente.', 'middle', 'toast-success');
  }

  listMode()
  {
    this.feedback.changeMode([false, false]);
    this.cleanProfesor();
    this.filter = '';
  }

  getFilter()
  {
    if(this.filter == '')
    {
      this.getProfesores();
    } else 
    {
      this.profesores = this.profesoresFirst.filter(profesor => profesor.nombre.includes(this.filter));
      this.listMode();
    }
    this.checkEmpty(2, false);
  }

  checkEmpty(index: number, value: boolean)
  {
    if(this.profesores.length == 0)
    {
      this.feedback.emptyMode[0] = value;
      this.feedback.emptyMode[index] = !value;
    }
  }

  clickEmpty(index: number)
  {
    if(index == 1)
    {
      this.feedback.changeMode([true, false]);
    } else
    {
      this.getProfesores();
      this.checkEmpty(2, true);
    }
  }

  cleanProfesor()
  {
    this.profesor = {id: null, nombre: '', numero: '', correo: ''} as Profesor;
  }

  ngOnDestroy() 
  { 
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
