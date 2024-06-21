"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionDBX = exports.ipLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//import { type } from 'os';
const version = "004";
var ipLogNewSchema = new mongoose_1.default.Schema({
    ipAddress: { type: String, required: true },
    urls: Array,
    hosts: Array,
    counter: { type: Number, default: 0 },
    countergesamt: { type: Number, default: 0 },
    gesperrt: { type: Boolean, default: false },
    create_date: { type: Date, default: Date.now },
    last_date: { type: Date, default: Date.now }
});
ipLogNewSchema.index({ create_date: 1 }, { expireAfterSeconds: 60 * 60 * 1 }); // 1 Stunde
exports.ipLog = mongoose_1.default.model('ipNewLog', ipLogNewSchema);
const SessionSchema = new mongoose_1.default.Schema({ _id: String }, { strict: false });
exports.SessionDBX = mongoose_1.default.model('sessions', SessionSchema, 'sessions');
