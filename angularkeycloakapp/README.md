# Angular App mit Keycloak und Node Express Proxy

## Installation:

Damit Angular unter dem Prox (myProxy) läuft muss noch folgendes eingerichtet werden:


  - für den Produktions mode in startPortSSl.ts: 

   const key = fs.readFileSync(__dirname + "/ssl/privkey20.key");
   const cert = fs.readFileSync(__dirname + "/ssl/cert20.cer");
   const ca = fs.readFileSync(__dirname + "/ssl/fullchain20.cer");

   // HTTPS-Agent mit Zertifikaten
   
   const httpsAgent = new https.Agent({
       key: key,
       cert: cert,
       ca: ca
   });

   //ssl port Node Express
   // Alles was an keycloak geht wird ausgewertet.

   appPort443.use("/keycloak**", (req, res, next) => {
       limiter.resetKey(req.ip);
       resetIP(req.ip, 1).then((rcx) => {
           next();
       });
       // next();
   },
   // Proxyumleitung
   createProxyMiddleware("/", {
       target: 'https://<servername>:8443', // Zielserver (Keycloak-Container)
       changeOrigin: true,
       secure: false, // Deaktiviert die SSL-Verifikation (nicht empfohlen für Produktion)
       agent: httpsAgent,
       headers: {
           host: '<servername>', // Setze den Host-Header explizit
       },
       pathRewrite: {
           "^/keycloak": "", // rewrite path
           //'^/*':'/mypwaapp/browser/',
       },
       onError: onError,
   }), (req, res, next) => {
       console.log("Nach keycloak: ", req.url, " org: ", req.originalUrl);
   }
);
   
appPort443.use((req, res, next) => {
   if (req.hostname == "<servername>") 
       {
           next()
       }
       else {
           console.log("FEHLER: ",req.url);
  
           return;
       }
   },

   // Der Angular Server läuft im Docker auf port 4100
   createProxyMiddleware("/", {
    target: "https://<servername>:4100",
    changeOrigin: true,
    pathRewrite: {
      "^/*": "/", // rewrite path
     
    },
    onError: onError,
  }),
  (req, res, next) => {
    console.log("Nach Server: ", req.url, " org: ", req.originalUrl);
  }
  )

