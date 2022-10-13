const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userId: String,
    email: String,
    referralId: String,
    numberOfReferrals: Number,
    referrals: [{ idOfReferral: String }],
});

module.exports = mongoose.model('Users', userSchema)