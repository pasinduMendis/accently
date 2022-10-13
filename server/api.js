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
const cors = require('cors')
const fetch=require('node-fetch')

mongoose.connect('mongodb+srv://user-1:VDFbIjPJKt6oGydc@project-accently-develo.obbqzel.mongodb.net/users?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const access_token = "EAAUlXa7VgRIBAIDt1C3ompVQg8U72V23wKsgYuXEDsIQw82s7cuR67W5XjNegLn5odJlJFNx3htoz4WpZBJWXIzm33loq9zsiO7L7E2Luq4AqElOkM2hpNZBvdd3UJ4mY527qT57G7pLU1ckbL58whIGpE71JTzCFJaDat6ewqVZAhUjIjh";
const pixel_id = '503294586998134';

app.use(bodyParser.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestIp.mw());


//Facebook Server Side Tracking Script
router.post("/server-side-tracking", async (req, res) => {
  
  let current_timestamp = Math.floor(new Date() / 1000);
  /* res.json({
    message: current_timestamp,
  }) */
  const testData={
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
}

/* await axios.post(`https://graph.facebook.com/v9.0/${pixel_id}/events?access_token=${access_token}`,
  testData
  ).then((response)=>{
  res.json(response.data)
    }).catch(err => {
      console.log(err)
      res.json(err.message)
    }) */
    const response = await fetch(`https://graph.facebook.com/v9.0/${pixel_id}/events?access_token=${access_token}`, {
      method: 'post',
      body: JSON.stringify(testData),
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json();
    res.json(data)
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