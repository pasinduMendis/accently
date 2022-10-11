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

app.get('/',()=>console.log("done"))

app.use("/test", router);

module.exports.handler = serverless(app);