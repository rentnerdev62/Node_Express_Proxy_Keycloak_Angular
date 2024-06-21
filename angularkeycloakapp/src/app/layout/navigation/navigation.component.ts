import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { StartappComponent } from "../../login/startapp.component";
import { KeycloakServiceService,refillRoles } from '../../service/keycloak-service.service';
import { Unsub } from '../../service/unsub.class';
import { WitzeComponent } from "../demo/witze.component";
import { ChucknorrisComponent } from "../demo/chucknorris.component";
import { ProfileComponent } from "../demo/profile.component";
import { AllgemeinComponent } from "../demo/allgemein.component";

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.css',
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        AsyncPipe,
        StartappComponent,
        WitzeComponent,
        ChucknorrisComponent,
        ProfileComponent,
        AllgemeinComponent
    ]
})
export class NavigationComponent  extends Unsub implements OnInit,AfterViewInit{

  refillLogout() {
    this.keycloak.keycloak.logout();
}
switchto(arg0: refillRoles) {
  if (arg0 === refillRoles.Alle) {
    window.open("http://host.docker.internal:8080","blank");
    
  } else {
    
   this.showDemo = arg0
  }
}

  private breakpointObserver = inject(BreakpointObserver);
  
  keycloak:KeycloakServiceService = inject(KeycloakServiceService)

  isStarted:boolean = false;

  refillroles = refillRoles
  showDemo = refillRoles.Keine

  ngOnInit(): void {
    console.log("start:0 ", this.isStarted);
    this.keycloak.authok
    .pipe(takeUntil(this._onDestroy))
    .subscribe((result) => {
      this.isStarted=result;
    })
  }
  ngAfterViewInit(): void {
   
  }
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    logout() {
      this.keycloak.keycloak.logout();
      }

      hasdemoRefill():boolean {
        return this.keycloak.hasFlag(refillRoles.Stufe1)
        
      }
      hasprofileRefill():boolean {
        return this.keycloak.hasFlag(refillRoles.Stufe2)
        
      }

      haschucknorrisRefill():boolean {
        return this.keycloak.hasFlag(refillRoles.Stufe3)
        
      }
      haswitzeRefill():boolean {
        return this.keycloak.hasFlag(refillRoles.Stufe4)
        
      }
      hasadminRefill():boolean {
        return this.keycloak.hasFlag(refillRoles.Alle)
        
      }
}
