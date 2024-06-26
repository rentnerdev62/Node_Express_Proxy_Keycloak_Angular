﻿# Node_Express_Proxy_Keycloak_Angular

Einrichtung :
 - Keycloak als Docker Container
 - AngularKeycloakApp als Docker, die app läuft Port 4100
 - Proxy als Docker mit Express, Epress-proxy-middleware

## Für reine Lokal App bitte die Anpassung in den config.ts vornehmen und host.docker.internal gegen localhost austauschen.

# Beschreibung:

- Der Proxy ist nur auf Port 443 erreichbar. Die erreichbaren Pfade leiten an die entsprechenden Docker Apps weiter.
- Es wird ein reguläres SSL zertifikat verwendet. (Im Produktion Mode)
- Cors ist ausgeschaltet
- Die Sessions werden nur auf servername ausgestellt.
- Weiter Sicherungen: 
    - Helmet
    - Ratelimit
    - protokolierung der Zugriffe und Limit bei 200 Zugriffen.

- Als Datenbank wird Mongodb verwendet.


## Installation:
 - servername, ServerDB durch eigene Daten ersetzen
 - default.ts bearbeiten. Es wird config verwendet
 - <Dockerimage/ docker Hub> durch eigene Container ersetzen

    ## In den Verzeichnissen myProy, server/angularserver  und keycloakapp jeweils die Docker Container anlegen
    
 - mit Docker 
    - "dockerpush" Docker auf Docker Hub legen (Account erforderlich)
    - "dockerclean" Docker bereinigen !!! Vorsicht !!!
    - "docker:build" Docker Image anlegen

    ## Die einzelnen Docker Container starter (compose up)


# Demo

Eine Demo mit einfachem Produtions Modus, mit reverse Proxy, Keycloak und Angular App.

Je nach vergabe der Roles sind unterschiedliche Menus und Seiten freigeschaltet.
 

https://refill.de


Demo User: guido
Demo Passwort: 123456
 
Nach der Anmeldung ist Keycloak unter https://refill.de/keycloak erreichbar.

Demo Admin: demo
Demo Password: 123456
 
Es können Benutzer, Roles angelegt werden.

# BITTE nicht den DEMO Admin zerstören !! Ich weiß wie unsicher das Passwort ist !!
