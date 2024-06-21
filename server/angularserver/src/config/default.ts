"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    portProxyserver: 443,
    portKeycloak:8080,
    servername:"https://<servername>",
    USESSL:"0",
    USEDOCKER:"0",
    DATABASE_URL: "mongodb://host.docker.internal:27017/DemoDB",
    DATABASE_URL_LOCAL: "mongodb://127.0.0.1:27017/DemoDB",
    DATABASE_URL_WEB: "mongodb://<servername>:27017/<ServerDB>",
    MONGOURI: "mongodb://host.docker.internal:27017/DemoDB",
    MONGOURIWEB: "mongodb://<servername>:27017/<ServerDB>",
    MONGOURI_LOCAL: "mongodb://127.0.0.1:27017/DemoDB" 
    

};