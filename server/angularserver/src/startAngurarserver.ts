process.env["NODE_CONFIG_DIR"] = __dirname + "/config"; // + "../";
 
import config from "config";

import cors from "cors";

import express from "express";
import path from "path";
import MongoStore from "connect-mongo";

import http from "http";
import https from "https";
import limiter from "./rateLimit";

const db = require("./mongooseConnection").default

const guid_typescript = require("guid-typescript");

const SessionDBX = db.getSessionDBX;

export async function startAngularserver() {
  await db.waitUntilConnected()
  const session = require("express-session");
  // var helmet = require("helmet");
  const basicAuth = require("express-basic-auth");

  var cookieParser = require("cookie-parser");
 const PORT = "4100"; //config.get("portLoginserver");
  const appLoginPort = express();

  const DATABASE_URL: string = config.get("DATABASE_URL"); // process.env
  const expiryDate = new Date(Date.now() + 1 * 60 * 60 * 1000); //  1 Stunde ... 5 Sekunden

  //???241123 appLoginPort.use(showCokkies("start"), function (req, res, next) {
  appLoginPort.use(function (req, res, next) {
    res.setHeader("X-Powered-By", "New Server Technology by IMB");

    next();
  });

  appLoginPort.use(express.json());
  //???100324 
  appLoginPort.use(express.urlencoded({ extended: true }));

  const fs = require("fs");

  var loginServerPort;
  let zzPort443 = config.get("USESSL"); //process.env.USESSL
  console.log("Start SSL Server!!", zzPort443);
  if (zzPort443 === "1") {
    loginServerPort = https.createServer(
      {
        key: fs.readFileSync(__dirname + "/ssl/refill.key"),
        cert: fs.readFileSync(__dirname + "/ssl/refill.cer"),
        ca: fs.readFileSync(__dirname + "/ssl/fullrefill.cer"),
        //ca: fs.readFileSync(__dirname + '/chain14.pem')
      },
      appLoginPort
    );
  } else {
    console.log("Start Angular Server!!");
    loginServerPort = http.createServer(appLoginPort);
  }

  // appLoginPort.use(helmet());
  // appLoginPort.disable('x-powered-by')
  appLoginPort.set("x-powered-by", "New Server Technology by IMB");
  appLoginPort.set('trust proxy', 1);
   
  //???210624 appLoginPort.use(cors());
  appLoginPort.use(express.json());
  appLoginPort.use(cookieParser());

  var RateLimit = require("express-rate-limit");

  var MongoStoredb = require("rate-limit-mongo");
  console.log("Database: ", DATABASE_URL);
  async function changeTTL(newTTL) {
    try {
      // Verbinde dich zur Datenbank
     
      // Lösche den bestehenden TTL-Index
      await SessionDBX.collection.dropIndex('expires_1');
      console.log('Alter TTL-Index gelöscht');
  
      // Erstelle einen neuen TTL-Index mit dem gewünschten TTL-Wert
      await SessionDBX.collection.createIndex({ expires: 1 }, { expireAfterSeconds: newTTL });
      console.log('Neuer TTL-Index erstellt mit TTL:', newTTL);
  
    } catch (err) {
      console.error('Fehler beim Ändern der TTL:', err);
    } finally {
      // Schließe die Verbindung zur Datenbank
      //mongoose.connection.close();
    }
  }



  // Session Einrichten
  appLoginPort.use(
    session({
      name: "SessionHttps",
      secret: "anystringoftext",
      saveUninitialized: false,
      resave: false,
      rolling: true,
      
      store: MongoStore.create({
        mongoUrl: DATABASE_URL,
        // ttl: 60 * 60 * 1, // 1 Stunde
        autoRemove: 'native', // Default
      }),
      cookie: {
        /*
        httpOnly: true,
        secure: false,
        sameSite: true,
        domain: 'localhost',
        path: '/',
       // expires: expiryDate,
        maxAge: 1000 * 31 * 1 * 1, //1 Stunde
        */
      },
    }))
    /*,
     (req:any, res, next) => {
      var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
      var key1 = guid_typescript.Guid.raw();
      if (req.session.loginData) {
          
      }
      else {
          req.session.loginData = {
              userId: "",
              loggedIn: false,
              target: "refill",
              ip: ip,
              loginKey: key1,
          };
      }
      if (req.session.count) {
          //???080324
          //console.log("Count: ",req.session.count)
      }
      else {
          console.log("Count:INITX ", req.sessionID);
       
   
          req.session.count = 1;
      }
      // console.log("Count:INIT ", req.session.count);
      // req.session.cookie.maxAge = 1000 * 31; //mxAge; // 45 * 1000
      next();
  }
  );*/
  appLoginPort.use(limiter, (req: any, res, next) => {
      var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
    //  limiter.resetKey(req.ip);
    next();
  })

  appLoginPort.get("^/$|/index(.html)?", (req: any, res, next) => {
    
    // Login Versuche zählen...
   
    if (req.session) {
      //???300324 console.log("loginData:1 ", req.session.loginData);

        try 
        {
          try 
          {
            try {
                let data = fs.readFileSync( path.join(__dirname, "/my-keycloak-angular-app/browser/index.html"), 'utf8');
                // const modifiedHtml = data.replace("c1mnKhK9BnKcpGKNmaPK6c", req.session.loginData.loginKey);
                res.send(data);
            }
            catch (err) {
                console.error("Fehler:", err);
            }
            //res.sendFile(path_1.default.join(__dirname, "/login-app/browser/index.html"));
           
          }
          catch (err) 
        {
            console.error("Fehler:", err);
          }

         //???080424 res.sendFile(path.join(__dirname, "/login-app/browser/index.html"));
        }
        catch (error) 
        {
          console.log("Cokies:20 Error:1 ", error);
          
          res.status(500).send("<h1>system error exists.. </h1> <h2> start back tracing ... catched. Bye</h2>");
 
          // res.status(501).send("<a href='https://rheingauerspieletreff.de'>Login Zeit abgelaufen. Neue Anmeldung...</a>"            ); 
        }
    
    } else {
      res.status(500).send("<h1>faulty session.. </h1> <h2> start back tracing ... catched. Bye</h2>");
    }
  

  });

  appLoginPort.use((req,res,next ) => {
    const kHeaders = Object.getOwnPropertySymbols(req).find(sym => sym.toString() === 'Symbol(kHeaders)');

    if (kHeaders) {
      console.log('Headers:',req.url," == ", req[kHeaders].origin);
      if (req[kHeaders].origin && req[kHeaders].origin==="http://localhost:4100") {
        console.log("redirect...");
        
        res.status(501).send("FEHLER")
        
      }
    } else {
      console.log('Symbol(kHeaders) nicht gefunden.');
    }
    limiter.resetKey(req.ip);
    next()
  })
  appLoginPort.use(express.static(path.join(__dirname, "/my-keycloak-angular-app/browser")));
  //appLoginPort.use(express.static(path.join(__dirname, "/login-app/browser/fonts")));
  //appLoginPort.use(express.static(path.join(__dirname, "/login-app/browser/images")));

   
  appLoginPort.get("/**",limiter, (req, res, next) => {
    // spieleinfo

    var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;

    console.log(
      "Fehlerhafter Aufruf:XX1X ",
      req.headers.host,
      " = ",
      req.url,
      " IP: ",
      ip,
      " Datum: ",
      new Date(Date.now())
    );
    res.status(200).send("Fehler...Refill Server");
    //  next();
    // res.writeHead(404, { "Content-Type": "text/plain" });
    //???230224 res.status(404).send("Sorry can't find that!");
    //???240224 res.redirect("https://rheingauerspieletreff.de"); //.status(200).send("Hallo");
  });

  //???230224 loginServerPort.listen(PORT, () => {
  loginServerPort.listen(PORT, () => {
    console.log("Listen port: ", PORT);
  });
  
  }
