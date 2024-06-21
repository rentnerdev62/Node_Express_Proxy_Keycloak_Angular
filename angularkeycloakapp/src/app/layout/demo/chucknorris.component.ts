import { Component, inject } from '@angular/core';
import { ApiResponse, ChucknorrisService } from '../../service/chucknorris.service';
import { Unsub } from '../../service/unsub.class';
import { takeUntil } from 'rxjs';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  selector: 'app-chucknorris',
  standalone: true,
  imports: [MatCardModule,MatChipsModule],
  templateUrl: './chucknorris.component.html',
  styleUrl: './chucknorris.component.css'
})
export class ChucknorrisComponent extends Unsub {
  joke!: ApiResponse;
  api:ChucknorrisService = inject(ChucknorrisService)
 // constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getJoke();
  }

  getJoke(): void {
    this.api.getData()
    .pipe(takeUntil(this._onDestroy))
    .subscribe(data => this.joke = data);

  }
}
