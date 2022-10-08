const express = require("express");
const router = express.Router();
const serverless = require("serverless-http");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
require("./customFunctions/userModel");
const User = mongoose.model("users");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const requestIp = require('request-ip');

mongoose.connect(process.env.MONGO_URI);

const app = express();

const access_token = process.env.FACEBOOK_ACCESS_TOKEN;
const pixel_id = process.env.FACEBOOK_PIXEL_ID;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIp.mw())

//Facebook Server Side Tracking Script
router.post("*/server-side-tracking", async (req, res) => {

  let current_timestamp = Math.floor(new Date() / 1000);

  try {
    console.log("1");
    console.log("Event Name" + req.body.eventName);
    console.log("Event Time" + current_timestamp);
    console.log("Event ID" + req.body.eventId);
    console.log("Event URL" + req.body.eventUrl);
    console.log("Event IP" + req.clientIp);
    console.log("Event IP" + req.headers['user-agent']);

    await axios.post(`https://graph.facebook.com/v9.0/${pixel_id}/events?access_token=${access_token}`, {
      data: [
        {
          "event_name": req.body.eventName,
          "event_time": current_timestamp,
          "action_source": "website",
          "event_id": req.body.eventId,
          "event_source_url": req.body.eventUrl,
          "user_data": {
            //"client_ip_address": req.clientIp,
            //"client_user_agent": req.headers['user-agent']
            "em": "5212712b4c6c5e4f8d424529b89c52ee70f27b79df12a3e77d9ac587d2d1e737",
            "ph": "44afb7aee4773c8d346b3b1f2bc747041b47e0d7bab92aa6bacb54b733a75591"
          }
        }
      ]
    });
    console.log("2");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success"
      })
    };

  } catch (err) {

    console.log("3");
    console.log("Error: " + err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err
      })
    };

  }
})

//Email submission endpoint
router.post("*/submit", async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });

  if (!existingUser) {
    const shortIdVariable = shortid.generate();
    const user = await new User({
      email: req.body.email,
      referralId: shortIdVariable,
      numberOfReferrals: 0
    }).save();
  }
  res.redirect("/early-access");
});

//Stripe Payment Endpoint
app.post("*/charge", async (req, res) => {
  const token = req.body.stripeToken;

  const charge = await stripe.charges.create(
    {
      amount: 10000,
      currency: "usd",
      description: "Down payment for first access to Accently",
      source: token,
    },
    function (err, charge) {
      if (charge) {
        console.log("Success: " + charge);
        res.redirect("/thank-you-early-access");
      }
      if (err) {
        console.log("Error: " + err);
        res.redirect("/early-access");
      }
    }
  );
});

app.use("/", router);

module.exports.handler = serverless(app);