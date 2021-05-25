import TutoringSession from "../models/TutoringSession.js";

//WHAT SHOULD BE IN HERE ---------------------
const sendMorningReminders = async (tz) => {
  const sessionsToday = await TutoringSession.getTodaysSessions();
  if (sessionsToday.length) {
    sessionsToday.forEach(async (session) => {
      session.sendRemindersToParticipants({ type: "sessionToday", tz: tz });
    });
  }
  return Promise.resolve(true);
};

const sendLastCallReminders = async (params) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + params.leadTime * 60 * 1000);
  const upcommingSessions = await TutoringSession.getSessionsStartingBetween(
    startTime,
    endTime
  );
  if (upcommingSessions.length) {
    upcommingSessions.forEach((session) => {
      session.sendRemindersToParticipants({ type: "lastCall" });
    });
  }
};
//--------------------------

export default sendMorningReminders;
export { sendLastReminder };
