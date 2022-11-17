const mongoose = require("mongoose");
require("./customFunctions/userModel");
const User = mongoose.model("users");
const shortid = require("shortid");
const cookie = require('cookie');

exports.handler = async (event, context) => {

  const array = event.body.split("email=");
  const email = decodeURIComponent(array[1]);
  const myCookie = cookie.serialize('emailHash', email);

  try {
    mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {

    }

    if (!existingUser) {
      const shortIdVariable = shortid.generate();

      const user = await new User({
        email: email,
        referralId: shortIdVariable,
        numberOfReferrals: 0
      }).save();
    }
    mongoose.disconnect();

    return {
      statusCode: 302,
      headers: {
        "Location": "https://accently.ai/early-access",
        'Set-Cookie': myCookie
      },
      body: "Success",
    };

  } catch (err) {

    return {
      statusCode: 400,
      body: err,
    };

  }
};