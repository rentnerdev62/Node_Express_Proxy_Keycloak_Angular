import config from "config";
import express, { request, Request, Response, NextFunction } from "express";
import {createProxyMiddleware} from "http-proxy-middleware";
import https from "https";
import http from "http";
import path from "path";

var cookieParser = require("cookie-parser");
var session = require("express-session");
const guid_typescript = require("guid-typescript");


var helmet = require("helmet");

import MongoStore from "connect-mongo";
import limiter from "./rateLimit";


const Database = require("./mongooseConnection").default

var ipLog = null;

export async function startPort443() {
  const db = Database;
  await db.waitUntilConnected();
  
  ipLog = db.getipLog;
  const appPort443 = express();

  const fs = require("fs");

  
  
  const zzPort443 = config.get("USESSL"); //process.env.USESSL
  
  console.log("Start SSL Server!!", zzPort443);

  const tls = require('tls');
 
  let myServerPort443 = null;
   
 if (zzPort443 === "1") {

   const options = {
       key: fs.readFileSync(__dirname + "/ssl/<sslkey>"),
       cert: fs.readFileSync(__dirname + "/ssl/<sslzertifikat>.cer"),
       ca: fs.readFileSync(__dirname + "/ssl/<sslca>.cer"),
       
   };
     // Erstellen Sie den sicheren Kontext
     const secureContext1 = tls.createSecureContext(options);
     
     // Erstellen Sie den HTTPS-Server mit dem sicheren Kontext
     myServerPort443 = https.createServer({
       SNICallback: (hostname, cb) => {
           if (hostname ==="<servername") {
            
               cb(null, secureContext1);      
           }
           else {
               cb(new Error("FEHLER!!!")); 
           }
         
       }
     }, appPort443);
  }
  else {
    myServerPort443 = http.createServer({},appPort443)
  }

 appPort443.use((req, res, next) => {
  //const ipAddress = req.ip;
  const hostname = req.hostname;
  const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
  
  // Wenn req.hostname eine IP-Adresse ist, dann wurde KEINE Domaine verwendet !
  const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
  
  if (isIPAddress) {
      // console.log('Die Anfrage wurde über die IP-Adresse gesendet:', ipAddress);
      checkIP(ip as string, req.url, 1).then((rc) => 
      {
          // console.log("RC: ",rc);
          //if (!rc) {
          //}
          res.status(403).send("<h1>Failled using ip address ! too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>");        
      
      });
      
  }
  else 
  {
      // console.log('Die Anfrage wurde über den DNS-Namen gesendet:', hostname);
    checkIP(ip as string, req.url, 100,req.hostname).then((rc) => 
      {
            if (!rc) {
                next();
            }
            else {
                res.status(403).send("<h1>Failled ! too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>");
            }
        });
      }
  
});
appPort443.set('trust proxy', 1);
   
  //Helmet:

  appPort443.use(helmet.dnsPrefetchControl());
  appPort443.use(helmet.frameguard({ action: "SAMEORIGIN" }));
  appPort443.use(helmet.hidePoweredBy());
  appPort443.use(helmet.hsts());
  appPort443.use(helmet.ieNoOpen());
  appPort443.use(helmet.noSniff());
  appPort443.use(helmet.permittedCrossDomainPolicies());
  appPort443.use(helmet.referrerPolicy());
  
  var useDocker = "";
  config.get("MONGOURI");
  useDocker = config.get("MONGOURI");


  var mxAge = 1000 * 31 * 1  * 1; // 1 Stunde
  

  
  // Session starten bzw erneut laden
  appPort443.use(
    session({
      name: "SessionHttps",
      secret: "sollte auch über config gehen..",
      saveUninitialized: false,
      resave: false,
      rolling: true,
      store: MongoStore.create({
        mongoUrl: useDocker,
        // ttl: 60 * 60 * 1, // 1 Stunde
        autoRemove: 'native', // Default
      }),
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: true,
        domain: "localhost",
        path: "/",
        // expires: new Date(Date.now() + 1 * 60 * 60 * 1000), //  1 Stunde ... 5 Sekunden expiryDate,
        maxAge: 1000 * 31 * 1 * 1, // 31s 1 Stunde
      },
    }),
    (req: any, res, next) => {
      var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
      var key1 = guid_typescript.Guid.raw(); 
      if (req.session.loginData) {
        //???080324 
        console.log("LoginData bereits vorhanden: ",req.sessionID,req.session.loginData)
      } else {
       
        req.session.loginData = {
          userId: "",
          loggedIn: false,
          target: "",
          ip:ip,
          loginKey:key1,
        };
      }
      if (req.session.count) {
        //???080324
        //console.log("Count: ",req.session.count)
      } else {
  
        req.session.count = 1;
      }
      // console.log("Count:INIT ", req.session.count);

      req.session.cookie.maxAge = mxAge; // 45 * 1000
     
      next();
    }
  );
  
  appPort443.use(limiter, (req: any, res, next) => {
    var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
 
      if (req.session.loginData.loggedIn) {
        limiter.resetKey(req.ip);

        resetIP(ip, 1).then((rcx) => {
          if (rcx) {
            res
              .status(200)
              .send(
                "<h1>Failled Login.. too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>"
              );
          } else {
            //???090324 console.log("Aufruf: ",req.headers.host, " reqip:", req.ip, " = ", req.url, " IP: ", ip, " Datum: ", new Date(Date.now()))
            next();
          }
        });
      } else {
        checkIP(ip as string, req.url, 250,req.hostname).then((rcx) => {
          if (rcx) {
            res
              .status(200)
              .send(
                "<h1>too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>"
              );
          } else {
            next();
          }
        });
      }
    
  });
  appPort443.use(express.static(path.join(__dirname, "public")));


  appPort443.use("/",(req, res, next) => {
    console.log("Angular Server",req.url);
    
    if (req.hostname == "refill.de") 
        {
 
            // res.status(200).send("Alles OK!")
            next()
        }
        else {
            console.log("Refill:01 ",req.url);
   
            next();
        }
        limiter.resetKey(req.ip);

    },
 
    
    createProxyMiddleware("/", {
     target: "http://localhost:4100", //config.get("servername") + ":" + config.get("portLoginserver"),
     changeOrigin: true,
     pathRewrite: {
       "^/*": "/", // rewrite path
       //'^/*':'/mypwaapp/browser/',
     },
     onError: onError,
   }),limiter,
   (req, res, next) => {
     console.log("Nach Local Server: ", req.url, " org: ", req.originalUrl);
   }
   )
 



  //???250224 Der Rest können nur Fehlaufrufe sein...
  appPort443.use("/**", (req, res, next) => {
  
    var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;

    console.log(
      "Fehlerhafter Aufruf Port443: ",
      req.headers.host,
      " = ",
      req.url,
      " IP: ",
      ip,
      " Datum: ",
      new Date(Date.now())
    );

    res.clearCookie("SessionHttps");
    res.status(200).send("start back tracing ... catched. Bye");

    // res.status(500).send("Sorry can't find that!");
  });
 
  const PORT = config.get("portProxyserver") || Number(process.env.PORT || 443); // config.get("port"); // Number(process.env.PORT || 2567);

  myServerPort443.listen(PORT, () => {
    console.log("Listen port: ", PORT);
  });

  function onError(err, req, res, target) {
    console.log("Error: ", err, req.url);
    res.writeHead(200, {
      "Content-Type": "text/plain",
    });
    res.end(
      "Something went wrong. And we are reporting a custom error message."
    );
  }

  async function checkIP(ip: string, url: string, cnt: number,hostName:string="leer") {
    var rc = false;
    await ipLog.findOne({ ipAddress: ip }).then((result) => {
      if (result) {
        //???120823
        result["counter"]++;
        //???120823
        result["countergesamt"]++;

        result["last_date"] = new Date(Date.now());

        //???080324 console.log("Login Versuch3 ", result["counter"])
        if (!result.urls.includes(url)) {
          //???300324 console.log("Login Versuch31 ", result["counter"]);

          result.urls.push(url);
        }
        if (!result.hosts.includes(hostName)) {
          //???300324 console.log("Login Versuch31 ", result["counter"]);
          result.hosts.push(hostName);
      }
        if (result["counter"] >= cnt) {
          result["gesperrt"] = true;
          rc = true;
        }
        result.save().then((rc1) => {
          return rc;
        });
      } else {
        var newLog = new ipLog();
        newLog["ipAddress"] = ip;
        //???120823 newLog["counter"]++
        //???120823 newLog["countergesamt"]++;
        newLog["counter"] = 0;
        newLog["countergesamt"] = 0;
        newLog["gesperrt"] = false;

        newLog.urls = [];
        newLog.urls.push(url);
        newLog.hosts = [];
        newLog.hosts.push(hostName);
        
        //???300324 console.log("Neue Adresse:X1 ", newLog);
        rc = false;
        newLog.save().then((rc2) => {
          return rc;
        });
      }
    });

    return rc;
  }

  async function resetIP(ip: string, cnt: number) {
    var rc = false;
    await ipLog.findOne({ ipAddress: ip }).then((result) => {
      if (result) {
        //???120823
        result["counter"] = cnt;
        //???120823
        result["countergesamt"] = cnt;

        result["last_date"] = new Date(Date.now());

        result["gesperrt"] = false;
        rc = false;
        result.save().then((rc1) => {
          return rc;
        });
      } else {
        rc = true;
      }
    });

    return rc;
  }

}
