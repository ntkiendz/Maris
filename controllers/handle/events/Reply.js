module.exports.Reply = async function (api, event) {
    if (!event.messageReply) return;
    const { Reply, commands } = global.client;
    const { messageID, threadID, messageReply } = event;
    if (Reply.length !== 0) {
        const ok = Reply.findIndex(e => e.messageID == messageReply.messageID);
        if (ok < 0) return;
        const dcmmm = commands.get(Reply[ok].name);
        if (!dcmmm) return api.sendMessage('Missing value', threadID, messageID);
        try {
            dcmmm.Reply(api,event,Reply[ok]);
        } catch (error) {
            return api.sendMessage(`error: ${error}`, threadID, messageID);
        }
    }
};