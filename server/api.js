const express = require("express");
const router = express.Router();
const serverless = require("serverless-http");
const stripe = require("stripe")('sk_test_51LqNwNCOIV1QF3sYrz9r3VQrG7QdM1frC4edqFSGyhiQoF2A3Ao45QPjOvsNmSuPZZRQpzIhVJLVoArD6hbAAyqZ00jWJ2rxMH');
const mongoose = require("mongoose");
require("./customFunctions/userModel");
const User = mongoose.model("users");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const requestIp = require('request-ip');

mongoose.connect('mongodb+srv://user-1:VDFbIjPJKt6oGydc@project-accently-develo.obbqzel.mongodb.net/users?retryWrites=true&w=majority');

const app = express();

const access_token = "EAAUlXa7VgRIBALIZBU5tQCZAZA4fScxl3ZAA5ASViClaksqBCx4kCeKqNQiEM2Q7OQZBKEEo9ZAD2HrXnuxJWZAt8gnnBUZC4uMTNsA6k5SA3egkCDxSygi6auvZBX07vptoTLbFPfLKCEEMrXxSZCPHsjDdxwwOPGsWeUVxS2HXrdZCkmJxGOg9dsZB";
const pixel_id = '503294586998134';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIp.mw())

//Facebook Server Side Tracking Script
router.post("/server-side-tracking", async (req, res) => {
  console.log("********")
  
  let current_timestamp = Math.floor(new Date() / 1000);
  await axios.post(`https://graph.facebook.com/v9.0/${pixel_id}/events?access_token=${access_token}`, {
      data: [
        {
          "event_name": req.body.eventName,
          "event_time": current_timestamp,
          "action_source": "website",
          "event_id": req.body.eventId,
          "event_source_url": req.body.eventUrl,
          "user_data": {
            "client_ip_address": req.clientIp,
            "client_user_agent": req.headers['user-agent']
          }
        }
      ]
    }).then((response)=>{
        res.json(response.data)
    });
  res.json(current_timestamp)
  /* try {
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
            "client_ip_address": req.clientIp,
            "client_user_agent": req.headers['user-agent']
          }
        }
      ]
    }).then((response)=>{
        res.json(response.data)
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

  } */
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
router.get("/", async (req, res) => {
  res.json("abc")
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "msg"
    })
  };
  
})
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

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);