module.exports.Reaction = async function (api, event) {
    if (!event.messageReply) return;
    const { Reaction, commands } = global.client;
    const { messageID, threadID, messageReply } = event;
    if (Reaction.length !== 0) {
        const ok = Reaction.findIndex(e => e.messageID == messageReply.messageID);
        if (ok < 0) return;
        const dcmmm = commands.get(Reaction[ok].name);
        if (!dcmmm) return api.sendMessage('Missing value', threadID, messageID);
        try {
            dcmmm.Reaction(api,event,Reaction[ok]);
        } catch (error) {
            return api.sendMessage(`error: ${error}`, threadID, messageID);
        }
    }
};