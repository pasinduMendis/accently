const express = require("express");
const router = express.Router();
const serverless = require("serverless-http");
const stripe = require("stripe")('sk_test_51LqNwNCOIV1QF3sYrz9r3VQrG7QdM1frC4edqFSGyhiQoF2A3Ao45QPjOvsNmSuPZZRQpzIhVJLVoArD6hbAAyqZ00jWJ2rxMH');
const mongoose = require("mongoose");
const User = require("./customFunctions/userModel");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const cookieParser = require("cookie-parser");
const axios=require('axios')
const requestIp = require('request-ip');
const { json } = require("body-parser");
const cors = require('cors')

mongoose.connect('mongodb+srv://user-1:VDFbIjPJKt6oGydc@project-accently-develo.obbqzel.mongodb.net/users?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const access_token = "EAAUlXa7VgRIBALIZBU5tQCZAZA4fScxl3ZAA5ASViClaksqBCx4kCeKqNQiEM2Q7OQZBKEEo9ZAD2HrXnuxJWZAt8gnnBUZC4uMTNsA6k5SA3egkCDxSygi6auvZBX07vptoTLbFPfLKCEEMrXxSZCPHsjDdxwwOPGsWeUVxS2HXrdZCkmJxGOg9dsZB";
const pixel_id = '503294586998134';

app.use(bodyParser.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIp.mw())

//Facebook Server Side Tracking Script
router.post("/server-side-tracking", async (req, res) => {
  console.log("********")
  let current_timestamp = Math.floor(new Date() / 1000);
  
  try {
    /* console.log("1");
    console.log("Event Name" + req.body.eventName);
    console.log("Event Time" + current_timestamp);
    console.log("Event ID" + req.body.eventId);
    console.log("Event URL" + req.body.eventUrl);
    //console.log("Event IP" + req.clientIp);
    //console.log("Event IP" + req.headers['user-agent']); */

    /* const data=[
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
    ] */

    await axios.post(`https://reqbin.com/sample/post/json`, 
    {
      "data": [
          {
              "event_name": "Index Page View",
              "event_time": 1665550936,
              "action_source": "website",
              "event_id": "1",
              "event_source_url": "https://www.accently.ai/",
              "user_data": {
                  "em": "5212712b4c6c5e4f8d424529b89c52ee70f27b79df12a3e77d9ac587d2d1e737",
                  "ph": "44afb7aee4773c8d346b3b1f2bc747041b47e0d7bab92aa6bacb54b733a75591"
              }
          }
      ]
  }
  ).then((response)=>{
        
  res.json({
    message: current_timestamp,
    body:req.body,
    response:response,
  })
    }).catch(err => {
      res.json({
        err:err,
        //req:req,
      })
    })

    /* return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Success"
      })
    }; */

  } catch (err) {

    console.log("3");
    console.log("Error: " + err);
    res.json({
      err:err
    })

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