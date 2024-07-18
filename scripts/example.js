module.exports = {
    name: 'example',
    description: 'ABCXYZ',
    credits: 'Name',
    Group: 'Nhóm',
    usage: 'test',
    Start(api, event, args) {
        api.sendMessage(`Có cái lồn haha`,event.threadID,(err, info) => {
            if (err) return console.error(err);
            global.client.Reply.push({
                name: module.exports.name,
                author: event.senderID,
                messageID: info.messageID,
                threadID: event.threadID,
            });

            global.client.Reaction.push({
                name: module.exports.name,
                author: event.senderID,
                messageID: info.messageID,
                threadID: event.threadID,
            });

        });
        console.log('Running example command', event.threadID);
    },
    Events(api, event) {
    },
    Reply(api, event,Reply) {
        // console.log(event)
        api.sendMessage(`${event.body} cái lồn`,event.threadID,event.messageID)
        console.log('Reply', event.threadID);
    },
    Reaction(api, event) {
        api.sendMessage(` cái lồn`,event.threadID,event.messageID)
        console.log('Reaction', event.threadID);
    },
    Load(api) {
        console.log('Load');
    }
};
