"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// rateLimitMiddleware.ts
const config_1 = __importDefault(require("config"));
const DATABASE_URL = config_1.default.get("DATABASE_URL"); // process.env
var RateLimit = require("express-rate-limit");
var MongoStoredb = require("rate-limit-mongo");
//import RateLimit from 'express-rate-limit';
var limiter = RateLimit({
    store: new MongoStoredb({
        uri: DATABASE_URL, //'mongodb://127.0.0.1:27017/test_dbXX',
        legacyHeaders: false,
        expireTimeMs: 60 * 60 * 1000,
        errorHandler: console.error.bind(null, "rate-limit-mongo"),
        // see Configuration section for more options and details
    }),
    max: 10,
    // should match expireTimeMs
    windowMs: 60 * 60 * 1000,
    message: async (_req, _res) => {
        // _res.status(501);
        return "You can only make 10 requests every 24 hour.";
    },
    statusCode: 501,
});
exports.default = limiter;
