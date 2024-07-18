const handle = require('./handle/commands');
const Events = require('./handle/events/Events');
const reply = require('./handle/events/Reply');
const reac = require('./handle/events/Reaction');
const unsend = require('./handle/events/Unsend');
const noti = require('./handle/events/Noti');

module.exports = async (api, event) => {
    const { logMessageType, type } = event;
    if (logMessageType) {
        noti.Noti(api, event, logMessageType);
    } else if (type) {
        switch (type) {
            case 'message':
                handle.commands(api, event);
                Events.Events(api, event);
                break;
            case 'message_reaction':
                reac.Reaction(api, event);
                unsend.Unsend(api, event);
                break;
            case 'message_reply':
                reply.Reply(api, event);
                break;
            case 'message_unsend':
                break;
            default:
        }
    }
};
