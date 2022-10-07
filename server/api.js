const express = require("express");
const router = express.Router();
const serverless = require("serverless-http");
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

const access_token = 'EABmbwDokfFkBADVrXJZCZAXZBZCHK8ISBzfng7j4SopX34oJyhBKcFZCog76gVdMGJ4xZBUEknSV0zloddssR5WKDIwoNKqWFYC6L2R10zAZCR53gASb0w0qyfXCbDH4polp3klP5wOFbXRnp9w13ZBX6NnZAVEgXQ8sKV6CyjZBEl9i1jIVOZA722w'; //Change this
const pixel_id = '491730835753732'; //Change this
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

  const serverEvent = (new ServerEvent())
    .setEventName(req.body.eventName)
    .setEventTime(current_timestamp)
    .setUserData(userData)
    .setEventSourceUrl(req.body.eventUrl)
    .setActionSource('website')
    .setEventId(req.body.eventId);

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
app.post("/charge", async (req, res) => {
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
        res.redirect("/thank-you-early-access");
      }
      if (err) {
        res.redirect("/early-access");
      }
    }
  );
});

app.use("/", router);

module.exports.handler = serverless(app);
