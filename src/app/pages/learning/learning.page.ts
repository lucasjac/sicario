import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Materia } from 'src/app/models/materia';
import { NotifierService } from 'src/app/services/notifier.service';
import { DateService } from 'src/app/services/date.service';
import { Concepto } from 'src/app/models/concepto';

@Component({
  selector: 'app-learning',
  templateUrl: './learning.page.html',
  styleUrls: ['./learning.page.scss'],
})
export class LearningPage implements OnInit {
  private concepto: Concepto;
  private conceptos: Concepto[];
  private materias: Materia[];
  private cantidad: number;
  private mode: number;
  clickBack: Subscription;

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    public feedback: FeedbackService,
    private notifier: NotifierService,
    private date: DateService)
  {
    this.materias = [];
    this.mode = 0;
    this.cleanConcepto();
    this.clickBack = this.feedback.getClickBack().subscribe(() => {
      this.mode = 0;
      this.cleanConcepto();
      this.getConceptos();
    });
  }
  
  ngOnInit() {
    this.getConceptos();
    this.getMaterias();
  }

  getConceptos()
  {
    if(this.feedback.pageMode[0] || this.feedback.pageMode[1])
      this.listMode();
    this.cleanConcepto();
    this.firestoreService.getList('conceptos').subscribe((result) => {
      this.conceptos = [];
      this.cantidad = 0;
      result.forEach((datos: any) => {
        let concepto = {id: datos.payload.doc.id, materia: datos.payload.doc.data().materia, 
          termino: datos.payload.doc.data().termino, definicion: datos.payload.doc.data().definicion} as Concepto;
        this.cantidad++;
        this.conceptos.push(concepto);
      });
    });
  }

  getMaterias()
  {
    this.firestoreService.getList('materias').subscribe((result) => {
      this.materias = [];
      result.forEach((datos: any) => {
        let materia = {id: datos.payload.doc.id, nombre: datos.payload.doc.data().nombre, profesor: datos.payload.doc.data().profesor, 
          fecha_ini: this.date.getDate(datos.payload.doc.data().fecha_ini), 
          fecha_fin: this.date.getDate(datos.payload.doc.data().fecha_fin), horario: datos.payload.doc.data().horario,
          dia: datos.payload.doc.data().dia, cantidad: datos.payload.doc.data().cantidad
        } as Materia;
        this.materias.push(materia);
      });
    });
  }

  viewConceptos()
  {
    this.mode = 1;
    this.feedback.changeMode([true, false]);
  }

  async clickSave()
  {
    if(this.concepto.termino != '' || this.concepto.definicion != '')
    {
      const loading = await this.notifier.loading('Guardando...');
      loading.present();
      if(this.concepto.id)
      {
        this.firestoreService.update('conceptos', this.concepto.id, this.concepto).then(() => this.getConceptos());
      } else
      {
        this.firestoreService.create("conceptos", this.concepto).then(() => {
          this.getConceptos();
        }, (error) => {
          console.error[error];
        });
      }
      loading.dismiss();
      this.notifier.toast('La definición se ha guardado exitosamente.', 'middle', 'toast-success');
    } else 
    {
      this.notifier.toast('El término y la definición no deben estar vacíos.', 'middle', 'toast-alert');
    }
  }

  async clickDelete(concepto: Concepto)
  {
    const loading = await this.notifier.loading('Eliminando...');
    loading.present();
    this.firestoreService.delete('conceptos', concepto.id).then(() => this.getConceptos());
    loading.dismiss();
    this.notifier.toast('La materia se ha eliminado exitosamente.', 'middle', 'toast-success');
  }

  redirect()
  {
    if(this.cantidad >= 4)
    {
      this.router.navigate(['/quiz']);
    } else
    {
      this.notifier.toast('Definiciones insuficientes para practicar (Mínimo 4).', 'middle', 'toast-alert');
    }
  }

  listMode()
  {
    this.mode = 0;
    this.feedback.changeMode([false, false]);
    this.cleanConcepto();
  }

  clickEmpty(index: number)
  {
    this.feedback.changeMode([true, false]);
  }

  cleanConcepto()
  {
    this.concepto = {id: null, materia: '', termino: '', definicion: ''} as Concepto;
  }
}
