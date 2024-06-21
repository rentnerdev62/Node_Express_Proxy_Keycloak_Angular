process.env["NODE_CONFIG_DIR"] = __dirname + "/config"; // + "../";
import config from "config";
console.log("config: ",config.get("servername"));

const Database = require("./mongooseConnection").default
 import { startPort443 } from "./startPortSSL";

test();

async function test() {
  await Database.waitUntilConnected();
  
  console.log("Start Server...Database OK");
  startPort443();
}
