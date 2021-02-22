const sendText = (params) => {
  console.log(
    `(type: ${params.type}) texting ${params.attendeeType} ${params.attendee} ${params.number}: ${params.message}`
  );
};

module.exports = sendText;
