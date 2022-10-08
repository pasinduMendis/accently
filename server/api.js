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
const bizSdk = require('facebook-nodejs-business-sdk');
const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;
const requestIp = require('request-ip');

mongoose.connect(process.env.MONGO_URI);

const app = express();

const access_token = process.env.FACEBOOK_ACCESS_TOKEN;
const pixel_id = process.env.FACEBOOK_PIXEL_ID;
const api = bizSdk.FacebookAdsApi.init(access_token);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIp.mw())

//Facebook Server Side Tracking Script
router.post("*/server-side-tracking", async (req, res) => {

  let current_timestamp = Math.floor(new Date() / 1000);

  const userData = (new UserData())
    .setClientIpAddress(req.clientIp)
    .setClientUserAgent(req.headers['user-agent'])

  //console.log('Event Name: ', req.body.eventName);
  //console.log('Event URL: ', req.body.eventUrl);
  //console.log('Event ID: ', req.body.eventId);

  const serverEvent = (new ServerEvent())
    .setEventName(req.body.eventName)
    .setEventTime(current_timestamp)
    .setUserData(userData)
    .setEventSourceUrl(req.body.eventUrl)
    .setActionSource('website')
    .setEventId(req.body.eventId)
    .settest_event_code("TEST96764");

  const eventsData = [serverEvent];
  const eventRequest = (new EventRequest(access_token, pixel_id))
    .setEvents(eventsData);

  eventRequest.execute().then(
    response => {
      console.log('Response: ', response);
    },
    err => {
      console.error('Error: ', err);
    }
  );
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