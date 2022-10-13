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
const FormData = require('form-data');

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

const form = new FormData();
form.append('data', '[\n       {\n         "event_name": "Purchase",\n         "event_time": 1665680218,\n         "user_data": {\n           "em": [\n             "309a0a5c3e211326ae75ca18196d301a9bdbd1a882a4d2569511033da23f0abd"\n           ],\n           "ph": [\n             "254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4",\n             "6f4fcb9deaeadc8f9746ae76d97ce1239e98b404efe5da3ee0b7149740f89ad6"\n           ],\n           "client_ip_address": "123.123.123.123",\n           "client_user_agent": "$CLIENT_USER_AGENT",\n           "fbc": "fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890",\n           "fbp": "fb.1.1558571054389.1098115397"\n         },\n         "contents": [\n           {\n             "id": "product123",\n             "quantity": 1,\n             "delivery_category": "home_delivery"\n           }\n         ],\n         "custom_data": {\n           "currency": "usd",\n           "value": 123.45\n         },\n         "event_source_url": "http://jaspers-market.com/product/123",\n         "action_source": "website"\n       }\n     ]');

await axios.post(
    'https://graph.facebook.com/v9.0/503294586998134/events?access_token=EAAUlXa7VgRIBAIDt1C3ompVQg8U72V23wKsgYuXEDsIQw82s7cuR67W5XjNegLn5odJlJFNx3htoz4WpZBJWXIzm33loq9zsiO7L7E2Luq4AqElOkM2hpNZBvdd3UJ4mY527qT57G7pLU1ckbL58whIGpE71JTzCFJaDat6ewqVZAhUjIjh',
    form,
    {
        headers: {
            ...form.getHeaders()
        }
    }
).then((response)=>{
  res.json(response.data)
    }).catch(err => {
      console.log(err)
      res.json(err.message)
    })
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