function printEvents(events){
    events.forEach((event) => {
        let start = event.start || event.date;
        console.log(`${start.dateTime} - ${event.summary}`);
    });
};

export default printEvents;