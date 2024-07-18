const fs = require('fs');
const path = require('path');

global.client = {
    commands: new Map(),
    stop: new Map(),
    Reaction: [],
    Reply: []
};

const file = fs.readdirSync(path.join(__dirname, '../scripts')).filter(file => file.endsWith('.js'));

module.exports = (api) => {
    for (const files of file) {
        const command = require(path.join(__dirname, '../scripts', files));
        global.client.commands.set(command.name, command);
        if (typeof command.Load === 'function') {
            command.Load(api);
        }
    }
};
