const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    userId: String,
    email: String,
    referralId: String,
    numberOfReferrals: Number,
    referrals: [{ idOfReferral: String }],
});

mongoose.model('users', userSchema);