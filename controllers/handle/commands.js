const fs = require('fs-extra');
const path = require('path');

module.exports.commands = async function (api, event) {
    const setupPath = path.resolve(__dirname, '../../setup.json');
    const setUpTxt = await fs.readFile(setupPath, 'utf-8');
    const setUpFile = JSON.parse(setUpTxt);
    if (event.body.startsWith(setUpFile.PREFIX)) {
        const args = event.body.slice(setUpFile.PREFIX.length).trim().split(/ +/);
        const cmdn = args.shift().toLowerCase();
        if (global.client.commands.has(cmdn)) {
            const command = global.client.commands.get(cmdn);
            try {
                command.Start(api, event, args);
            } catch (error) {
                console.error(`Error ${cmdn}:`, error);
            }
        } else {
            api.sendMessage(`Modules không tồn tại!\nDùng menu để xem tất cả lệnh đang có trên bot!`, event.threadID);
        }
    }
};