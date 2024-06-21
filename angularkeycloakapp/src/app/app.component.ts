import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeycloakServiceService } from './service/keycloak-service.service';
import { NavigationComponent } from "./layout/navigation/navigation.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, NavigationComponent]
})
export class AppComponent {
  keycloak:KeycloakServiceService = inject(KeycloakServiceService)
  title = 'MyKeycloakAngularApp';
}
