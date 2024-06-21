import mongoose, { Schema } from 'mongoose';
import model, { Model } from 'mongoose';
//import { type } from 'os';
const version = "004"



var ipLogNewSchema = new mongoose.Schema({
    ipAddress: { type: String, required: true },
    urls:Array,
    hosts:Array,
    counter: { type: Number, default: 0 },
    countergesamt: { type: Number, default: 0 },
    gesperrt: { type: Boolean, default: false },
    create_date: { type: Date, default: Date.now },
    last_date: { type: Date, default: Date.now }

});
ipLogNewSchema.index({create_date: 1},{expireAfterSeconds: 60 * 60 * 1 }); // 1 Stunde

export var ipLog = mongoose.model('ipNewLog', ipLogNewSchema);
 
const SessionSchema = new mongoose.Schema({_id:String}, { strict: false });
export var SessionDBX = mongoose.model('sessions', SessionSchema, 'sessions');



