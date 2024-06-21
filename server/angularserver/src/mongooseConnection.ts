
import config from "config";
import mongoose, { Connection } from 'mongoose';
import { SessionDBX, ipLog } from "./iplog";
let instance: Database | null = null;
class Database {
  private connection:any; 
  private initialized: boolean;


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

  private async connect(): Promise<void> {
    try {
      this.connection = (await mongoose.connect(config.get("DATABASE_URL")));
    } catch (err) {
      console.error('Fehler beim Verbinden mit MongoDB:', err);
      throw err;
    }
  }

  public async waitUntilConnected(): Promise<void> {
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


  public disconnect() {
    // Verbindung von der MongoDB trennen
    if (this.connection) {
      mongoose.disconnect();
    }
  }

  public get getipLog() { 
    console.log("Return iplog: ",ipLog);
    
    return ipLog;
  }

  public get getSession() { 
    return SessionDBX;
  }

  get getSessionDBX() {
    return SessionDBX;
  }
  // Weitere Methoden für andere Modelle können hier hinzugefügt werden...
}

export default instance?instance:new Database; //
