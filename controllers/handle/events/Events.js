module.exports.Events = async function (api, event) {
    for (const module of global.client.commands.values()) {
        if (module && module.Events) {
            await module.Events(api, event);
        }
    }
}