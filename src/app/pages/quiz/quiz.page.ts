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
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
})
export class QuizPage implements OnInit {
  private playing: boolean;
  private answered: boolean;
  private answers: string[];
  private result: string;
  private classes: string[];
  private materia: string;
  private conceptosFirst: Concepto[];
  private conceptos: Concepto[];
  private concepto: Concepto;
  private materias: Materia[];
  clickBack: Subscription;

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    public feedback: FeedbackService,
    private notifier: NotifierService,
    private date: DateService)
  {
    this.materia = "Todas";
    this.playing = false;
    this.answered = false;
    this.answers = ['', '', ''];
    this.materias = [];
    this.conceptos = [];
    this.clickBack = this.feedback.getClickBack().subscribe(() => {
      if(this.playing)
      {
        this.feedback.changeMode([false, false]);
        this.playing = false;
      } else
      {
        this.router.navigate(['/learning']);
      }
    });
  }

  ngOnInit() 
  {
    this.feedback.changeMode([false, false]);
    this.getConceptos();
    this.getMaterias();
  }

  getConceptos()
  {
    this.firestoreService.getList('conceptos').subscribe((result) => {
      this.conceptosFirst = [];
      result.forEach((datos: any) => {
        let concepto = {id: datos.payload.doc.id, materia: datos.payload.doc.data().materia, 
          termino: datos.payload.doc.data().termino, definicion: datos.payload.doc.data().definicion} as Concepto;
        this.conceptosFirst.push(concepto);
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

  startPlaying()
  {
    if(this.materia == "Todas")
    {
      this.conceptos = this.conceptosFirst;
    } else
    {
      this.conceptos = this.conceptosFirst.filter(concepto => concepto.materia == this.materia);
    }
    if(this.conceptos.length > 2)
    {
      this.playing = true;
      this.chooseAnswers();
    } else 
    {
      this.notifier.toast('No hay definiciones suficientes para esta materia.', 'middle', 'toast-alert');
    }
  }

  chooseAnswers()
  {
    this.classes = ['button-answer', 'button-answer', 'button-answer'];
    this.answered = false;
    let answers = this.randomizer(0, this.conceptos.length);
    this.concepto = this.conceptos[answers[0]];
    let places = this.randomizer(0, 3);
    for(let i = 0; i < 3; i++)
    {
      this.answers[i] = this.conceptos[answers[places[i]]].definicion;
    }
  }

  randomizer(min, max)
  {
    let value = [null, null, null];
    let indexes = [1, 0, 0, 2, 2, 1];
    for(let i = 0; i < 3; i++)
    {
      do {
        value[i] = Math.floor(Math.random() * (max - min)) + min;
      } while(value[i] == value[indexes[i]] || value[i] == value[indexes[i+3]])
    }
    return value;
  }

  answerPicked(index: number)
  {
    if(this.answers[index] != this.concepto.definicion)
    {
      this.classes[index] = 'button-wrong';
      this.result = "La respuesta correcta es: '" + this.concepto.definicion + "'";
    } else
    {
      this.classes[index] = 'button-right';
      this.result = "¡Respuesta correcta!";
    }
    this.answered = true;
  }
}
