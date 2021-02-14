//Get all "committal availability" events for a specific tutor starting after start date
//filter those events into two separate lists, tutoring events and availability events using the .filter method
//Both lists need to be in order of start date.
//populate an array with a length of as many min are in a week with " " for every element. 
//Get the current date time and store it as a (start_search) variable 
//Get the first element in the the availability list and get it's start time, get number of min from start_search. get the number of min until the end of the event. change the elements in the array between those to positions to be "A". Do this for every evvent in "committal availability" list.
//then do the same thing for the tutoring events exept edit array to have "B" during the events


//////Parse Array//////
//get index of first and last "A" in every A group and store in an object
//convert those objects with start and end indexes to Date times
const {getCalendarId} = require('./calendars');
const {listEvents} = require('./listEvents');
const {DateTime} = require('luxon');

let startTime = new Date();
startTime.setHours(24,0,0,0);
let endTime = new Date(startTime.getTime());
const millisPerChar = 1000*60*15;

function getWeeklyTutorAvailability (calRegex, calendar){
    
    getCalendarId(calRegex, calendar)
    .then(id => {
        return listEvents(calendar, id, "");
    })
    .then((events) => {printAvailability(getAvailability(events))})
    .catch(err => console.log(err));
}

function getAvailability (allEvents) {
    endTime.setDate(startTime.getDate() + 7);
    const arrayLength = (endTime - startTime)/millisPerChar;
    console.log("start time", startTime.getTime());
    console.log("end time", endTime.getTime());

    console.log(arrayLength);
    let virtualSchedule = new Array(arrayLength).fill(" ");
    //should be in order of start date
    let availabilityEvents = allEvents.filter((event) => {
        return !/tutoring/i.test(event.summary);
    });
    //should be in order of start date
    let tutoringEvents = allEvents.filter((event) => {
        return /tutoring/i.test(event.summary);
    });
    availabilityEvents.forEach((event) => {
        //event.start.dateTime is currently a string I think, not a date object. Fix using luxon I think
        let startIndex = ((Date.parse(event.start.dateTime) - startTime.getTime())/millisPerChar) < 0 ? 0 : Math.floor((Date.parse(event.start.dateTime) - startTime.getTime())/millisPerChar);
        //console.log("start of free times", startIndex);
        let endIndex = (Date.parse(event.end.dateTime) - startTime.getTime())/millisPerChar;
        for(let i = startIndex; i < endIndex; i++){
            if(i>=virtualSchedule.length){
                break;
            }
            virtualSchedule[i] = 'A';
        }
    });
    tutoringEvents.forEach((event) => {

        let startIndex = ((Date.parse(event.start.dateTime) - startTime.getTime())/millisPerChar) < 0 ? 0 : Math.floor((Date.parse(event.start.dateTime) - startTime.getTime())/millisPerChar);
        //console.log(`start of busy: ${startIndex}`);
        let endIndex = (Date.parse(event.end.dateTime) - startTime.getTime())/millisPerChar;
  

        for(let i = startIndex; i < endIndex ; i++){
            if(i>=virtualSchedule.length){
                break;
            }
            //console.log('adding space at ', i);
            virtualSchedule[i] = ' ';
        }
    });
    //console.log("there is a busy time at index of", virtualSchedule.indexOf(' '));
    return getAvailabilityObjectsFromVirtualSchedule(virtualSchedule);
   
}

function getAvailabilityObjectsFromVirtualSchedule (virtualSchedule){
    //find start of availability - log in availability object
    //find end of availability - log in availability objectv as part of array
    //find next start and next end and log those in another availability object as part of an array
    let index = 0;
    let availabilityObjects = [];

    while(index<virtualSchedule.length){
        index = virtualSchedule.indexOf('A', index);
        if(index < 0){ break };
        let startAvailabilityPosition = index;
        let startAvailabilityTime = startAvailabilityPosition * millisPerChar;
        let endAvailabilityPosition = virtualSchedule.indexOf(' ', startAvailabilityPosition);
        if(endAvailabilityPosition < 0){endAvailabilityPosition = virtualSchedule.length};
        let endAvailabilityTime = endAvailabilityPosition * millisPerChar;

        availabilityObjects.push({dow: DateTime.fromMillis(startAvailabilityTime + startTime.getTime()).weekdayLong, start: DateTime.fromMillis(startAvailabilityTime + startTime.getTime()), end: DateTime.fromMillis(endAvailabilityTime + startTime.getTime())}); 

        index = endAvailabilityPosition;
      
    }

    return availabilityObjects;
}


function printAvailability(availabilityObjects){
     //array of objects with elements weekday and availabilityObject
     groupByDow(availabilityObjects);
     
    let outPut = "";
    groupByDow(availabilityObjects).forEach((day) => {
        let timeSlots = day.events.map((event) => {
            return `${event.start.toLocaleString(DateTime.TIME_SIMPLE)} - ${event.end.toLocaleString(DateTime.TIME_SIMPLE)}`;
        }).join(", ");
        outPut = `${outPut} 
        ${day.dow}: ${timeSlots}`;
    });
    console.log(outPut);
    

    ///OUTPUT///
    //Monday: 2pm - 8pm
    //Wednesday: 9:30am - 12pm, 3pm - 8pm
    //Friday: 9:00am - 9:00pm 
}

function groupByDow (availabilityObjects) {
    let days = [];
    let currentDay = null;
    availabilityObjects.forEach((event) => {
        if(!currentDay||(event.dow != currentDay.dow)){
            currentDay = {dow: event.dow, events: []};
            days.push(currentDay);
        }
        currentDay.events.push(event);
    });
    return days;
}


export default getWeeklyTutorAvailability;