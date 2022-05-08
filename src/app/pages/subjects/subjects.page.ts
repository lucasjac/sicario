import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Materia } from 'src/app/models/materia';
import { NotifierService } from 'src/app/services/notifier.service';
import { DateService } from 'src/app/services/date.service';
import { Profesor } from 'src/app/models/profesor';
import { AlertController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.page.html',
  styleUrls: ['./subjects.page.scss'],
})
export class SubjectsPage implements OnInit, OnDestroy {
  private materia: Materia;
  private materiasFirst: Materia[];
  private materias: Materia[];
  private profesores: Profesor[];
  private filter: string = '';
  private cantidad: number;
  private cantidadProfesores: number;
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
    this.materias = [];
    this.cleanMateria();
    this.clickBack = this.feedback.getClickBack().pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.cleanMateria();
      this.getMaterias();
    });
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).pipe(takeUntil(this.unsubscribe$)).subscribe(() =>{
      this.checkEmpty(2, true);
    });
  }
  
  ngOnInit() {
    this.getMaterias();
    this.getProfesores();
  }

  getMaterias()
  {
    if(this.feedback.pageMode[0] || this.feedback.pageMode[1])
      this.listMode();
    this.cleanMateria();
    this.firestoreService.getList('materias').subscribe((result) => {
      this.materiasFirst = [];
      this.cantidad = 0;
      result.forEach((datos: any) => {
        let materia = {id: datos.payload.doc.id, nombre: datos.payload.doc.data().nombre, profesor: datos.payload.doc.data().profesor, 
          fecha_ini: datos.payload.doc.data().fecha_ini, fecha_fin: datos.payload.doc.data().fecha_fin, 
          horario: datos.payload.doc.data().horario, dia: datos.payload.doc.data().dia, cantidad: datos.payload.doc.data().cantidad
        } as Materia;
        this.materiasFirst.push(materia);
        this.cantidad++;
      })
      this.materias = this.materiasFirst;
    });
  }

  getProfesores()
  {
    this.firestoreService.getList('profesores').subscribe((result) => {
      this.profesores = [];
      this.cantidadProfesores = 0;
      result.forEach((datos: any) => {
        let profesor = {id: datos.payload.doc.id, nombre: datos.payload.doc.data().nombre, 
          numero: datos.payload.doc.data().numero, correo: datos.payload.doc.data().correo} as Profesor;
        this.profesores.push(profesor);
        this.cantidadProfesores++;
      })
      this.profesores.sort();
    });
  }

  viewMateria(materia: Materia)
  {
    this.materia = {id: materia.id, nombre: materia.nombre, profesor: materia.profesor, fecha_ini: materia.fecha_ini, 
      fecha_fin: materia.fecha_fin, dia: materia.dia, horario: materia.horario, cantidad: materia.cantidad} as Materia;
    this.feedback.changeMode([true, false]);
  }

  async clickSave()
  {
    if(this.materia.nombre != '')
    {
      const loading = await this.notifier.loading('Guardando...');
      loading.present();
      if(this.materia.dia == '' || this.materia.horario == '' || this.materia.cantidad == '')
        this.checkCalendar();
      if(this.materia.id)
      {
        this.firestoreService.update('materias', this.materia.id, this.materia).then(() => this.getMaterias());
      } else
      {
        this.firestoreService.create("materias", this.materia).then(() => {
          this.getMaterias();
        }, (error) => {
          console.error[error];
        });
      }
      loading.dismiss();
      this.notifier.toast('La materia se ha guardado exitosamente.', 'middle', 'toast-success');
    } else 
    {
      this.notifier.toast('El nombre no debe estar vacío.', 'middle', 'toast-alert');
    }
  }

  async clickDelete()
  {
    const loading = await this.notifier.loading('Eliminando...');
    loading.present();
    this.firestoreService.delete('materias', this.materia.id).then(() => this.getMaterias());
    loading.dismiss();
    this.notifier.toast('La materia se ha eliminado exitosamente.', 'middle', 'toast-success');
  }

  listMode()
  {
    this.feedback.changeMode([false, false]);
    this.cleanMateria();
    this.filter = '';
  }

  getFilter()
  {
    if(this.filter == '')
    {
      this.getMaterias();
    } else 
    {
      this.materias = this.materiasFirst.filter(materia => materia.nombre.includes(this.filter));
      this.listMode();
    }
    this.checkEmpty(2, false);
  }

  checkEmpty(index: number, value: boolean)
  {
    if(this.materias.length == 0)
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
      this.getMaterias();
      this.checkEmpty(2, true);
    }
  }

  async checkProfesores()
  {
    if(this.cantidadProfesores == 0)
    {
      let confirmed = false;
      const alert = await this.alertController.create({
        header: 'No hay profesores registrados.',
        message: '¿Desea agregar un nuevo profesor?',
        buttons: ['Cancelar',
        {
          text: 'Confirmar',
          handler: () => {
            this.router.navigate(['/teachers']);
          }
        }]
      });
      await alert.present();
    }
  }

  async checkCalendar()
  {
    const alert = await this.alertController.create({
      header: 'Día y horario no establecidos.',
      message: 'Esta materia no aparecerá en el calendario.',
      buttons: ['Confirmar']
    });
    await alert.present();
  }

  cleanMateria()
  {
    this.materia = {id: null, nombre: '', profesor: '', fecha_ini: '', fecha_fin: '', dia: '', horario: '', cantidad: '2001-01-01T01:00:00-03:00'} as Materia;
  }

  ngOnDestroy() 
  { 
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
