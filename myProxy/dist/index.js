"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env["NODE_CONFIG_DIR"] = __dirname + "/config"; // + "../";
const config_1 = __importDefault(require("config"));
console.log("config: ", config_1.default.get("servername"));
const Database = require("./mongooseConnection").default;
const startPortSSL_1 = require("./startPortSSL");
test();
async function test() {
    await Database.waitUntilConnected();
    console.log("Start Server...Database OK");
    (0, startPortSSL_1.startPort443)();
}
