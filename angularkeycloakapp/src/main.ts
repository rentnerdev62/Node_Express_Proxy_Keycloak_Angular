import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
/*import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({

  url:'http://localhost:8080',
  realm:'myrealm',
  clientId:'myapp'
})
keycloak.init({onLoad:'login-required'}).then((auth) => {

  bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
})
*/
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));