const waitUntil = require("./util/waitUntil").default;
let calendarList = null;
exports.getCalendarId = async function (calMatch, calendar) {
  if (!calendarList) {
    calendar.calendarList.list({}, (err, res) => {
      if (err) return console.log("The API returned an error: " + err);
      //console.log(res.data);
      calendarList = res.data.items;
    });
    await waitUntil(() => {
      return calendarList;
    }, 3000);
  }
  //console.log(calendarList);

  for (let i = 0; i < calendarList.length; i++) {
    let cal = calendarList[i];
    //console.log(cal.summary, cal.id);
    if (cal.summary.match(calMatch)) {
      return Promise.resolve(cal.id);
    }
  }

  return Promise.reject("No matching calendar");
};

exports.calendarIds = {
  api_tester: "c_2o2a87sk2jo06d7p4pk6r7v9nc@group.calendar.google.com",
};
