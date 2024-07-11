import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileCompareComponent } from './file-compare/file-compare.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FileCompareComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'fileCompare';
}
