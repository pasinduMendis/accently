const requestIp = require('request-ip');
const bizSdk = require('facebook-nodejs-business-sdk');
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;
const cookie = require('cookie');

const access_token = process.env.FACEBOOK_ACCESS_TOKEN;
const pixel_id = process.env.FACEBOOK_PIXEL_ID;
const api = bizSdk.FacebookAdsApi.init(access_token);

exports.handler = async (event, context) => {

  const current_timestamp = Math.floor(new Date() / 1000);
  const clientIp = requestIp.getClientIp(event);
  const data = JSON.parse(event.body);
  let cookies = null;
  if (event.headers.cookie) {
    cookies = cookie.parse(event.headers.cookie);
  }

  let email = null;
  if (cookies) {
    if (cookies.emailHash) {
      email = cookies.emailHash;
    }
  }

  try {

    console.log("Event Fired: " + data.eventId);
    const userData = (new UserData())
      .setEmails([email])
      //.setPhones([data.phoneNumber])
      .setClientIpAddress(clientIp)
      .setClientUserAgent(event.headers['user-agent']);

    const serverEvent = (new ServerEvent())
      .setEventName(data.eventName)
      .setEventTime(current_timestamp)
      .setUserData(userData)
      .setEventSourceUrl(data.eventUrl)
      .setActionSource('website')
      .setEventId(data.eventId);

    const eventsData = [serverEvent];
    const eventRequest = (new EventRequest(access_token, pixel_id))
      //.setTestEventCode("TEST9001")
      .setEvents(eventsData);

    const response = await eventRequest.execute()

    return {
      statusCode: 200,
      body: "Success",
    };

  } catch (err) {

    console.log("11");
    console.log("Error: " + err);
    return {
      statusCode: 400,
      body: err,
    };

  }
};