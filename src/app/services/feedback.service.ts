import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService implements OnDestroy {
  private subject = new Subject<any>();
  pageMode: Array<boolean> = [false, false];
  emptyMode: Array<boolean> = [true, false, false];
  headerMode: boolean = false;
  show: boolean;
  search: boolean;
  plus: boolean;
  urls: string[] = ['/home', '/subjects', '/teachers', '/learning', '/calendar', '/profile', '/quiz'];
  titlesHeader: string[] = ['Tareas', 'Materias', 'Profesores', 'Aprendizaje', 'Calendario', 'Usuario', ''];
  iconsHeader: string[] = ['header-home', 'header-subjects', 'header-teachers', 'header-learning', 'header-calendar', 'header-user', ''];
  icons: string[] = ['icon-home', 'icon-subjects', 'icon-teachers', 'icon-learning', 'icon-calendar', '', ''];
  iconsFooter: string[] = ['', '', '', '', '', '', ''];
  title: string = '';
  icon: string = '';
  selected: number;
  private unsubscribe$ = new Subject<void>();

  constructor(private router: Router)
  { 
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).pipe(takeUntil(this.unsubscribe$)).subscribe(() =>{
      for(var i = 0; i < 7; i++)
      {
        if(this.router.url == this.urls[i])
        {
          this.show = true;
          this.title = this.titlesHeader[i];
          this.icon = this.iconsHeader[i];
          this.iconsFooter[i] = this.icons[i] + '-selected';
          this.selected = i;
        } else
        {
          this.iconsFooter[i] = this.icons[i];
        }
        if(this.router.url == '/login' || this.router.url == '/register' || this.router.url == '/signin')
          this.show = false;
        if(this.router.url == '/learning' || this.router.url == '/calendar' || this.router.url == '/quiz')
        {
          this.search = false;
        } else
        {
          this.search = true;
        }
        if(this.router.url == '/calendar')
        {
          this.plus = false;
        } else
        {
          this.plus = true;
        }
      }
    });
  }

  changeMode(pageMode: Array<boolean>)
  {
    this.headerMode = !this.headerMode;
    this.pageMode = pageMode;
  }

  sendClickBack()
  {
    this.subject.next();
  }

  getClickBack(): Observable<any>
  {
    return this.subject.asObservable();
  }

  ngOnDestroy() 
  { 
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
