import { Component, OnInit } from '@angular/core';
import { Tarea } from '../models/tarea';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit
{
  tarea: Tarea;
  tareas: any = [{
    id: '',
    data: {} as Tarea
   }];
   idTarea: string = null;

  constructor(private firestoreService: FirestoreService)
  {
    this.tarea = {} as Tarea;
  }

  clickButtonCreate()
  {
    console.log(this.idTarea);
    if(this.idTarea != null)
    {
      this.firestoreService.update('tareas', this.idTarea, this.tarea).then(() => {
        this.getTareas();
        this.tarea = {} as Tarea;
      });
    } else
    {
      this.firestoreService.create("tareas", this.tarea)
      .then(() => {
        console.log("Tarea creada exitosamente!");
        this.tarea = {} as Tarea;
      }, (error) => {
        console.error[error];
      });
      this.idTarea = null;
    }
  }

  getTareas(){
    this.firestoreService.getList('tareas').subscribe((result) => {
      this.tareas = [];
      result.forEach((datos: any) => {
        this.tareas.push({
          id: datos.payload.doc.id,
          data: datos.payload.doc.data()
        });
      })
    });
  }

  getTarea(){
    this.firestoreService.get('tareas', this.idTarea).subscribe((result) => {
      this.tareas = [];
      this.tareas.push({
        id: this.idTarea,
        data: result.payload.data()
      });
    });
  }

  setTarea(tareaSelected) {
    this.idTarea = tareaSelected.id;
    this.tarea.descripcion = tareaSelected.data.descripcion;
    this.tarea.materia = tareaSelected.data.materia;
    this.tarea.tipo = tareaSelected.data.tipo;
    this.tarea.fecha_crea = tareaSelected.data.fecha_crea;
    this.tarea.fecha_ent = tareaSelected.data.fecha_ent;
    this.tarea.puntaje = tareaSelected.data.puntaje;
    this.tarea.punt_log = tareaSelected.data.punt_log;
  }

  clickButtonUpdate(id) {
    this.firestoreService.update('tareas', id, this.tarea).then(() => {
      this.getTareas();
      this.tarea = {} as Tarea;
    });
  }

  clickButtonDelete(id) {
    this.firestoreService.delete('tareas', id).then(() => {
      this.getTareas();
      this.tarea = {} as Tarea;
    });
  }

  ngOnInit() {
    this.getTareas();
  }
}
