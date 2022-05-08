import { Component, OnInit, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FeedbackService } from 'src/app/services/feedback.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  @Input() title: string;
  buttons: string[] = ['icon', 'icon', 'icon', 'icon', 'icon'];

  constructor(
    public feedback: FeedbackService,
    private router: Router) 
  {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() =>{
      for(var i = 0; i < 5; i++)
      {
        if(this.feedback.selected == i)
        {
          this.buttons[i] = 'icon-selected';
        } else
        {
          this.buttons[i] = 'icon';
        }
      }
    });
  }

  ngOnInit()
  {
  }

  redirect(route: string)
  {
    this.router.navigate([route]);
  }
}
