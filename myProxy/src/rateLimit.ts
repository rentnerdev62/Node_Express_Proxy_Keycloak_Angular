// rateLimitMiddleware.ts
import config from "config";

const DATABASE_URL: string = config.get("DATABASE_URL"); // process.env

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
    message: async (_req: any, _res: any) => {
     // _res.status(501);
      return "You can only make 10 requests every 24 hour.";
    },
    statusCode:501,
  });
  
export default limiter;
