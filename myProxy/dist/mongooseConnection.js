"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const mongoose_1 = __importDefault(require("mongoose"));
const iplog_1 = require("./iplog");
let instance = null;
class Database {
    connection;
    initialized;
    constructor() {
        // Führen Sie hier die einmalige Initialisierung durch
        this.initialized = true;
        // Verbindung zur MongoDB herstellen und dann die Instanz initialisieren
        this.connect().then(() => {
            console.log('MongoDB Verbindung erfolgreich');
        }).catch((err) => {
            console.error('Fehler beim Verbinden mit MongoDB:', err);
        });
    }
    async connect() {
        try {
            this.connection = (await mongoose_1.default.connect(config_1.default.get("DATABASE_URL")));
        }
        catch (err) {
            console.error('Fehler beim Verbinden mit MongoDB:', err);
            throw err;
        }
    }
    async waitUntilConnected() {
        // Warte, bis die Verbindung hergestellt ist
        console.log("wait: ");
        if (!this.connection) {
            await new Promise((resolve) => {
                console.log("wait:1 ");
                setTimeout(resolve, 100); // Überprüfe alle 100 Millisekunden, ob die Verbindung hergestellt ist
            });
            await this.waitUntilConnected(); // Rekursiver Aufruf, bis die Verbindung hergestellt ist
        }
    }
    disconnect() {
        // Verbindung von der MongoDB trennen
        if (this.connection) {
            mongoose_1.default.disconnect();
        }
    }
    get getipLog() {
        console.log("Return iplog: ", iplog_1.ipLog);
        return iplog_1.ipLog;
    }
    get getSession() {
        return iplog_1.SessionDBX;
    }
    get getSessionDBX() {
        return iplog_1.SessionDBX;
    }
}
exports.default = instance ? instance : new Database; //
