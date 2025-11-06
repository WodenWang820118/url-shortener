import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UrlShortenerComponent } from './components/url-shortener.component';

@Component({
  imports: [UrlShortenerComponent, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'URL Shortener';
}
