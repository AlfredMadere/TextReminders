const accountSid = "ACb39decff641bf7d83d496220966c5d9c";
const authToken = "96bec47ee7b42b7a8f68d7daa33bb46a";

const client = require("twilio")(accountSid, authToken);

const sendText = (params) => {
  client.messages
    .create({
      to: params.number,
      from: "+17863479153",
      body: params.message,
    })
    .then((message) => console.log(message));
};

module.exports = sendText;
