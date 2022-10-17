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

/* await axios.post(
    'https://graph.facebook.com/v9.0/511814264084355/events?access_token=EAAMSHZAfiTrMBAH9hCtdV8ndbbgtUMjL6ZAOehwHMrid5HSWitumWM4qRsc11PYALh2uZCh7Kjy5RpDvDxCObSpzKBCbS8Ou1fKz4gJWB9cOUtHKPW1q48q3vFGtmj9ipbw93b4BhpiixMC8tdB5v6QSk7ryt2DZCtQByXBcTW9uPEnivGZCAQR1NLy6JdzQZD',
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
  res.json(response.data)
    }).catch(err => {
      console.log(err)
      res.json(err.message)
    }) */
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