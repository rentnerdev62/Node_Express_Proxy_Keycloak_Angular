import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()

export abstract class Unsub implements OnDestroy {
    _onDestroy = new Subject<void>();

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
  
    }
}