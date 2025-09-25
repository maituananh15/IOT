const mongoose = require('mongoose');

const deviceActionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceName: String,
  actions: String, 
  date: { type: Date, default: Date.now }
});

const DeviceAction = mongoose.model('DeviceAction', deviceActionSchema);
module.exports = DeviceAction;
