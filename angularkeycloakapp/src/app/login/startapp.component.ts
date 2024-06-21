import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { KeycloakServiceService } from '../service/keycloak-service.service';
import { CheckComponent } from "./check.component";
import { Unsub } from '../service/unsub.class';
import { takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { NavigationComponent } from "../layout/navigation/navigation.component";


@Component({
    selector: 'app-startapp',
    standalone: true,
    templateUrl: './startapp.component.html',
    styleUrl: './startapp.component.css',
    imports: [CheckComponent, MatButtonModule, NavigationComponent]
})
export class StartappComponent extends Unsub implements OnInit,AfterViewInit {
toogleprofile() {
this.keycloak.authok.next(!this.keycloak.authok.value)
}
  ngAfterViewInit(): void {
    console.log("start:1 ", this.isStarted);
    
    //this.isStarted =  false;
    console.log("start:2 ", this.isStarted);
    
  }
  
  isStarted:boolean = false;

  ngOnInit(): void {
    console.log("start:0 ", this.isStarted);
    this.keycloak.authok
    .pipe(takeUntil(this._onDestroy))
    .subscribe((result) => {
      this.isStarted=result;
    })
  }
  keycloak:KeycloakServiceService = inject(KeycloakServiceService)
 
logout() {
this.keycloak.keycloak.logout();
}




}
