const mongoose = require('mongoose');

const dataSensorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  temperature: Number,
  humidity: Number,
  light: Number,
  date: { type: Date, default: Date.now }
});

const DataSensor = mongoose.model('DataSensor', dataSensorSchema);
module.exports = DataSensor;
