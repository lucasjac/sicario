import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Materia } from 'src/app/models/materia';
import { Tarea } from '../../models/tarea';
import { NotifierService } from 'src/app/services/notifier.service';
import { DateService } from 'src/app/services/date.service';
import { AlertController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy
{
  private tarea: Tarea;
  private filter: string[] = ['', ''];
  private tareasFirst: Tarea[] = [];
  private tareas: Tarea[] = [];
  private materias: Materia[];
  private cantidad: number;
  private cantidadMaterias: number;
  clickBack: Subscription;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    public feedback: FeedbackService,
    private notifier: NotifierService,
    private date: DateService,
    public alertController: AlertController)
  {
    this.tareas = [];
    this.cleanTarea();
    this.clickBack = this.feedback.getClickBack().pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.cleanTarea();
      this.getTareas();
      this.tareas = this.tareas.filter(tarea => tarea.estado == 'No entregado');
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).pipe(takeUntil(this.unsubscribe$)).subscribe(() =>{
      this.checkEmpty(2, true);
    });
  }
  
  ngOnInit() {
    this.getTareas();
    this.getMaterias();
  }

  getTareas(){
    if(this.feedback.pageMode[0] || this.feedback.pageMode[1])
      this.listMode();
    this.cleanTarea();
    this.firestoreService.getList('tareas').subscribe((result) => {
      this.tareasFirst = [];
      this.cantidad = 0;
      result.forEach((datos: any) => {
        let tarea = {id: datos.payload.doc.id, descripcion: datos.payload.doc.data().descripcion, 
          materia: datos.payload.doc.data().materia, estado: datos.payload.doc.data().estado, 
          fecha_crea: datos.payload.doc.data().fecha_crea, fecha_ent: datos.payload.doc.data().fecha_ent, 
          puntaje: datos.payload.doc.data().puntaje, punt_log: datos.payload.doc.data().punt_log} as Tarea;
        this.cantidad++;
        this.tareasFirst.push(tarea);
      });
      this.tareas = this.tareasFirst.filter(tarea => tarea.estado == 'No entregado');
    });
  }

  getMaterias()
  {
    this.firestoreService.getList('materias').subscribe((result) => {
      this.materias = [];
      this.cantidadMaterias = 0;
      result.forEach((datos: any) => {
        let materia = {id: datos.payload.doc.id, nombre: datos.payload.doc.data().nombre, profesor: datos.payload.doc.data().profesor,
          fecha_ini: datos.payload.doc.data().fecha_ini, fecha_fin: datos.payload.doc.data().fecha_fin, 
          horario: datos.payload.doc.data().horario, dia: datos.payload.doc.data().dia, cantidad: datos.payload.doc.data().cantidad
        } as Materia;
        this.cantidadMaterias++;
        this.materias.push(materia);
        this.materias.sort();
      })
    });
  }

  viewTarea(tarea: Tarea)
  {
    this.tarea = {id: tarea.id, descripcion: tarea.descripcion, materia: tarea.materia, 
      estado: tarea.estado, fecha_crea: tarea.fecha_crea, fecha_ent: tarea.fecha_ent, 
      puntaje: tarea.puntaje, punt_log: tarea.punt_log} as Tarea;;
    this.feedback.changeMode([true, false]);
  }

  async clickSave()
  {
    if(this.tarea.descripcion != '' && this.tarea.fecha_ent != '')
    {
      const loading = await this.notifier.loading('Guardando...');
      loading.present();
      if(this.tarea.id)
      {
        this.firestoreService.update('tareas', this.tarea.id, this.tarea).then(() => this.getTareas());
      } else
      {
        this.tarea.fecha_crea = new Date().toDateString();
        this.firestoreService.create("tareas", this.tarea).then(() => { this.getTareas();}, 
        (error) => {
          console.error[error];
        });
      }
      loading.dismiss();
      this.notifier.toast('La tarea se ha guardado exitosamente.', 'middle', 'toast-success');
    } else 
    {
      this.notifier.toast('La descripción y la fecha de entrega no deben estar vacíos.', 'middle', 'toast-alert');
    }
  }

  async clickDelete()
  {
    const loading = await this.notifier.loading('Eliminando...');
    loading.present();
    this.firestoreService.delete('tareas', this.tarea.id).then(() => this.getTareas());
    loading.dismiss();
    this.notifier.toast('La tarea se ha eliminado exitosamente.', 'middle', 'toast-success');
  }

  stateTarea(tarea: Tarea)
  {
    let state: string;
    if(this.tarea.estado == 'No entregado')
    {
      state = 'Entregado';
    } else {
      state = 'No entregado';
    }
    tarea.estado = state;
    this.tarea = tarea;
    this.clickSave();
  }

  listMode()
  {
    this.feedback.changeMode([false, false]);
    this.cleanTarea();
    this.filter = ['', ''];
  }

  getFilter()
  {
    if(this.filter != ['', ''])
    {
      let tareas  = this.tareasFirst;
      if(this.filter[0] != '')
      {
        tareas = tareas.filter(tarea => tarea.descripcion.includes(this.filter[0]));
      }
      if(this.filter[1] != '')
      {
        tareas = tareas.filter(tarea => tarea.estado == this.filter[1]);
      }
      this.tareas = tareas;
    } else 
    {
      this.getTareas();
    }
    this.listMode();
    this.checkEmpty(2, false);
  }

  checkEmpty(index: number, value: boolean)
  {
    if(this.tareas.length == 0)
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
      this.getTareas();
      this.checkEmpty(2, true);
    }
  }

  async checkMaterias()
  {
    if(this.cantidadMaterias == 0)
    {
      let confirmed = false;
      const alert = await this.alertController.create({
        header: 'No hay materias registradas.',
        message: '¿Desea agregar una nueva materia?',
        buttons: ['Cancelar',
        {
          text: 'Confirmar',
          handler: () => {
            this.router.navigate(['/subjects']);
          }
        }]
      });
      await alert.present();
    }
  }

  cleanTarea()
  {
    this.tarea = {id: null, descripcion: '', materia: '', estado: 'No entregado', fecha_crea: '', fecha_ent: '', puntaje: '', punt_log: ''} as Tarea;
  }

  ngOnDestroy() 
  { 
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
