import _ from 'lodash';
import SessionLog from "./models/SessionLog.js";
import TutoringSession from "./models/TutoringSession.js";

const queueLogReminders = async (params) => {
        const bound1 = new Date();
        const bound2 = new Date(bound1.getTime() + 60 * 1000 * params.interval);
        const startTime = bound1 > bound2 ? bound2 : bound1;
        const endTime = bound1 > bound2 ? bound1 : bound2;
        const sessionList = await TutoringSession.getSessionsThat({startTime, endTime}, (event) => {
          return _.inRange(Date.parse(event.end.dateTime), startTime, endTime) && TutoringSession.isTutoringSession(event);
        });
        if (sessionList.length) {
          sessionList.forEach(async (session) => {
            let sessionLog = new SessionLog({ session: session });
            sessionLog.remindTutor({type: params.reminderType});
          });
        }
      };
queueLogReminders({reminderType: 'log',  interval: 50})
