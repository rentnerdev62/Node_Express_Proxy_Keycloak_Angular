"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPort443 = void 0;
const config_1 = __importDefault(require("config"));
const express_1 = __importDefault(require("express"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
var cookieParser = require("cookie-parser");
var session = require("express-session");
const guid_typescript = require("guid-typescript");
var helmet = require("helmet");
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const rateLimit_1 = __importDefault(require("./rateLimit"));
const Database = require("./mongooseConnection").default;
var ipLog = null;
async function startPort443() {
    const db = Database;
    await db.waitUntilConnected();
    ipLog = db.getipLog;
    const appPort443 = (0, express_1.default)();
    const fs = require("fs");
    const zzPort443 = config_1.default.get("USESSL"); //process.env.USESSL
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
        myServerPort443 = https_1.default.createServer({
            SNICallback: (hostname, cb) => {
                if (hostname === "<servername") {
                    cb(null, secureContext1);
                }
                else {
                    cb(new Error("FEHLER!!!"));
                }
            }
        }, appPort443);
    }
    else {
        myServerPort443 = http_1.default.createServer({}, appPort443);
    }
    appPort443.use((req, res, next) => {
        //const ipAddress = req.ip;
        const hostname = req.hostname;
        const ip = req.headers["x-real-ip"] || req.socket.remoteAddress;
        // Wenn req.hostname eine IP-Adresse ist, dann wurde KEINE Domaine verwendet !
        const isIPAddress = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
        if (isIPAddress) {
            // console.log('Die Anfrage wurde über die IP-Adresse gesendet:', ipAddress);
            checkIP(ip, req.url, 1).then((rc) => {
                // console.log("RC: ",rc);
                //if (!rc) {
                //}
                res.status(403).send("<h1>Failled using ip address ! too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>");
            });
        }
        else {
            // console.log('Die Anfrage wurde über den DNS-Namen gesendet:', hostname);
            checkIP(ip, req.url, 100, req.hostname).then((rc) => {
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
    config_1.default.get("MONGOURI");
    useDocker = config_1.default.get("MONGOURI");
    var mxAge = 1000 * 31 * 1 * 1; // 1 Stunde
    // Session starten bzw erneut laden
    appPort443.use(session({
        name: "SessionHttps",
        secret: "sollte auch über config gehen..",
        saveUninitialized: false,
        resave: false,
        rolling: true,
        store: connect_mongo_1.default.create({
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
    }), (req, res, next) => {
        var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
        var key1 = guid_typescript.Guid.raw();
        if (req.session.loginData) {
            //???080324 
            console.log("LoginData bereits vorhanden: ", req.sessionID, req.session.loginData);
        }
        else {
            req.session.loginData = {
                userId: "",
                loggedIn: false,
                target: "",
                ip: ip,
                loginKey: key1,
            };
        }
        if (req.session.count) {
            //???080324
            //console.log("Count: ",req.session.count)
        }
        else {
            req.session.count = 1;
        }
        // console.log("Count:INIT ", req.session.count);
        req.session.cookie.maxAge = mxAge; // 45 * 1000
        next();
    });
    appPort443.use(rateLimit_1.default, (req, res, next) => {
        var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
        if (req.session.loginData.loggedIn) {
            rateLimit_1.default.resetKey(req.ip);
            resetIP(ip, 1).then((rcx) => {
                if (rcx) {
                    res
                        .status(200)
                        .send("<h1>Failled Login.. too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>");
                }
                else {
                    //???090324 console.log("Aufruf: ",req.headers.host, " reqip:", req.ip, " = ", req.url, " IP: ", ip, " Datum: ", new Date(Date.now()))
                    next();
                }
            });
        }
        else {
            checkIP(ip, req.url, 250, req.hostname).then((rcx) => {
                if (rcx) {
                    res
                        .status(200)
                        .send("<h1>too many views.. </h1> <h2> start back tracing ... catched. Bye</h2>");
                }
                else {
                    next();
                }
            });
        }
    });
    appPort443.use(express_1.default.static(path_1.default.join(__dirname, "public")));
    appPort443.use("/", (req, res, next) => {
        console.log("Angular Server", req.url);
        if (req.hostname == "refill.de") {
            // res.status(200).send("Alles OK!")
            next();
        }
        else {
            console.log("Refill:01 ", req.url);
            next();
        }
        rateLimit_1.default.resetKey(req.ip);
    }, (0, http_proxy_middleware_1.createProxyMiddleware)("/", {
        target: "http://host.docker.internal:4100", //config.get("servername") + ":" + config.get("portLoginserver"),
        changeOrigin: true,
        pathRewrite: {
            "^/*": "/", // rewrite path
            //'^/*':'/mypwaapp/browser/',
        },
        onError: onError,
    }), rateLimit_1.default, (req, res, next) => {
        console.log("Nach Local Server: ", req.url, " org: ", req.originalUrl);
    });
    //???250224 Der Rest können nur Fehlaufrufe sein...
    appPort443.use("/**", (req, res, next) => {
        var ip = req.headers["x-real-ip"] || req.socket.remoteAddress; //.connection.remoteAddress;
        console.log("Fehlerhafter Aufruf Port443: ", req.headers.host, " = ", req.url, " IP: ", ip, " Datum: ", new Date(Date.now()));
        res.clearCookie("SessionHttps");
        res.status(200).send("start back tracing ... catched. Bye");
        // res.status(500).send("Sorry can't find that!");
    });
    const PORT = config_1.default.get("portProxyserver") || Number(process.env.PORT || 443); // config.get("port"); // Number(process.env.PORT || 2567);
    myServerPort443.listen(PORT, () => {
        console.log("Listen port: ", PORT);
    });
    function onError(err, req, res, target) {
        console.log("Error: ", err, req.url);
        res.writeHead(200, {
            "Content-Type": "text/plain",
        });
        res.end("Something went wrong. And we are reporting a custom error message.");
    }
    async function checkIP(ip, url, cnt, hostName = "leer") {
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
            }
            else {
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
    async function resetIP(ip, cnt) {
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
            }
            else {
                rc = true;
            }
        });
        return rc;
    }
}
exports.startPort443 = startPort443;
