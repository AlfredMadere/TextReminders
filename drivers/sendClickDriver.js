const sendText = (params) => {
  console.log(
    `texting ${params.attendeeType} ${params.attendee} ${params.number}: ${params.message}`
  );
};

module.exports = sendText;
