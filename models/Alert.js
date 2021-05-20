import Reminder from './Reminder.js';

class Alert extends Reminder {
    constructor(params){
        super(params);
    }
    sendAndRecord(){
        if (!(this.id in Reminder.sent) && this.recipient.number) {
            sendText({
              number: this.recipient.number,
              message: this.message,
              id: this.id,
              type: this.type,
              calendar: this.calendar,
            });
          }
          Reminder.sent[this.id] = 1;
    }

}

export default Alert;