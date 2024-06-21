import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KeycloakServiceService {

  private rolesRefill = new BehaviorSubject<refillRoles>(refillRoles.Keine);
   

  public keycloak: Keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'myrealm',
    clientId: 'myapp',
  });
  public authok = new BehaviorSubject<boolean>(false);

  public islocaltest: boolean = false;

  constructor() {
    if (this.islocaltest) {
      this.setFlag(refillRoles.Keine)
      this.setFlag(refillRoles.Alle)
      this.authok.next(true);
    } else {
      this.keycloak.init({ onLoad: 'login-required' }).then((auth) => {
       
        this.rolesRefill.next(refillRoles.Stufe1)

        var resourceAccess = this.keycloak.resourceAccess;
        if (resourceAccess) {
          console.log("Role:0 ",resourceAccess);
          console.log("Role:1 ", this.keycloak.hasResourceRole("Demo Refill","myapp"));

          // Zugriff auf spezifische Ressource
          //???180624
          /*
          if (resourceAccess['account']) { 
            var roles = resourceAccess['account'].roles;
            console.log('index: ', roles.indexOf('view-profile'));

            if (roles.indexOf('view-profile') >= 0) {
              this.authok.next(true);
            } else {
              this.authok.next(false);
            }
            console.log('Roles:', roles);
          }
          else */
          if (resourceAccess['myapp']) {
            var roles = resourceAccess['myapp'].roles;
            console.log('index: ', roles.indexOf('Demo Refill'));

            this.authok.next(false);
            this.resetFlags();
            // Auswertung der Rollen
            if (roles.indexOf('Demo Refill Admin') >= 0) {
              this.setFlag(refillRoles.Alle)
              this.authok.next(true);
            }
            else {
              if (roles.indexOf('Demo Refill') >= 0) {
                this.setFlag(refillRoles.Stufe1)
                this.authok.next(true);
              }
              if (roles.indexOf('Demo Profile') >= 0) {
                this.setFlag(refillRoles.Stufe2)
                this.authok.next(true);
              }
              if (roles.indexOf('Demo Chuck Norris') >= 0) {
                this.setFlag(refillRoles.Stufe3)
                this.authok.next(true);
              }
              if (roles.indexOf('Demo Meine Witze') >= 0) {
                this.setFlag(refillRoles.Stufe4)
                this.authok.next(true);
              }
            }
             
            console.log('Roles:', roles);
          }
        } else {
          console.log('No resource access information available');
        }
        this.keycloak.onAuthSuccess = () => {
          console.log('Authentication successful');
        };
    
        this.keycloak.onAuthError = (errorData) => {
          console.error('Authentication error', errorData);
        };
    
        this.keycloak.onAuthRefreshSuccess = () => {
          console.log('Token refreshed successfully');
        };
    
        this.keycloak.onAuthRefreshError = () => {
          console.error('Token refresh error');
        };
    
        this.keycloak.onAuthLogout = () => {
          console.log('User logged out');
        };
    
        this.keycloak.onTokenExpired = () => {
          console.warn('Token expired');
          this.keycloak.updateToken(30).then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed');
            } else {
              console.warn('Token refresh failed');
            }
          }).catch((error) => {
            console.error('Failed to refresh token', error);
          });
        };
      });
    }
  }


  setFlag(flag: refillRoles) {
    const currentFlags = this.rolesRefill.value;
    this.rolesRefill.next(currentFlags | flag);
}

clearFlag(flag: refillRoles) {
    const currentFlags = this.rolesRefill.value;
    this.rolesRefill.next(currentFlags & ~flag);
}

hasFlag(flag: refillRoles): boolean {
    return (this.rolesRefill.value & flag) !== 0;
}

resetFlags() {
    this.rolesRefill.next(refillRoles.Keine);
}


}
export enum refillRoles {
  Keine = 0,
  Stufe1= 1 << 0,
  Stufe2= 1 << 1,
  Stufe3= 1 << 2,
  Stufe4= 1 << 3,
  Alle = 1 << 4
}