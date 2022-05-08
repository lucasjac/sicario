import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Materia } from 'src/app/models/materia';
import { NotifierService } from 'src/app/services/notifier.service';
import { DateService } from 'src/app/services/date.service';
import { AlertController } from '@ionic/angular';
import { Semana } from 'src/app/models/semana';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  private materia: Materia;
  private materias: Materia[];
  private cantidad: number;
  private dias: string[];
  private calendario: string[][];
  clickBack: Subscription;

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    public feedback: FeedbackService,
    private notifier: NotifierService,
    private date: DateService,
    public alertController: AlertController)
  {
    this.calendario = Semana;
    this.dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    this.materias = [];
    this.cleanMateria();
  }

  ngOnInit() {
    this.getMaterias();
  }

  getMaterias()
  {
    this.cleanMateria();
    this.firestoreService.getList('materias').subscribe((result) => {
      this.materias = [];
      this.cantidad = 0;
      result.forEach((datos: any) => {
        let materia = {id: datos.payload.doc.id, nombre: datos.payload.doc.data().nombre, profesor: datos.payload.doc.data().profesor, 
          fecha_ini: this.date.getDate(datos.payload.doc.data().fecha_ini), 
          fecha_fin: this.date.getDate(datos.payload.doc.data().fecha_fin), horario: datos.payload.doc.data().horario,
          dia: datos.payload.doc.data().dia, cantidad: datos.payload.doc.data().cantidad
        } as Materia;
        this.materias.push(materia);
        if(materia.dia != '' && materia.horario != '')
        {
          this.cantidad++;
          let horario: Date = new Date(materia.horario);
          let cantidad: Date = new Date(materia.cantidad);
          let desde = horario.getHours();
          let hasta = desde + cantidad.getHours();
          let index = this.dias.indexOf(materia.dia);
          for(desde; desde < hasta; desde++)
          {
            this.calendario[index][desde] = materia.nombre;
          }
          /*for(let i = 0; i < 8; i++)
          {
            for(let j = 0; j < 25; j++)
            {
              console.log(materia.dia + ' == ' + this.calendario[i][0] + ' && (' + j + ' >= ' + desde + ' && ' + j + ' < ' + hasta);
              if(materia.dia == this.calendario[i][0] && (j >= desde && j < hasta))
              {
                this.calendario[i][j] = materia.nombre;
              }
            }
          }*/
        }
      });
    });
  }

  async clickEmpty()
  {
    const alert = await this.alertController.create({
      header: 'Registrar materias.',
      message: '¿Desea agregar una nueva materia al calendario?',
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

  cleanMateria()
  {
    this.materia = {id: null, nombre: '', profesor: '', fecha_ini: '', fecha_fin: '', dia: '', horario: '', cantidad: ''} as Materia;
  }
}
