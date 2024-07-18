module.exports = {
    name: 'menu',
    description: 'Xem tất cả các lệnh đang có trên bot',
    credits: 'niio-team (vtuan)',
    Group: 'Nhóm',
    usage: 'menu',
    Start(api, event) {
        const { commands } = global.client;
        const dcmm = new Map();

        commands.forEach(command => {
            if (!dcmm.has(command.Group)) {
                dcmm.set(command.Group, []);
            }
            dcmm.get(command.Group).push(command);
        });

        let message = '== [ MENU ] ==\n';
        let index = 1;
        for (const [group, cmds] of dcmm) {
            message += `${index}. ${group}: ${cmds.length} lệnh\n`;
            index++;
        }

        api.sendMessage(message, event.threadID, (err, info) => {
            if (err) return console.error(err);
            global.client.Reply.push({
                name: module.exports.name,
                author: event.senderID,
                messageID: info.messageID,
                type: 'listMenu',
                dcmm: JSON.stringify(Array.from(dcmm.entries()))
            });
        });
    },
    Reply(api, event, Reply) {
        const { type } = Reply;
        let dcmm = new Map(JSON.parse(Reply.dcmm));
        if (type === 'listMenu') {
            const nhap = parseInt(event.body);
            if (isNaN(nhap) || nhap < 1 || nhap > dcmm.size) {
                return api.sendMessage('Vui lòng chọn số thứ tự hợp lệ.', event.threadID);
            }
            const nhóm = Array.from(dcmm.entries())[nhap - 1];
            let message = `Danh sách lệnh trong nhóm ${nhóm[0]}:\n\n`;
            nhóm[1].forEach((command, index) => {
                message += `${index + 1}. ${command.name}: ${command.description}\n`;
            });

            api.sendMessage(message, event.threadID, (err, info) => {
                if (err) return console.error(err);
                global.client.Reply.push({
                    name: module.exports.name,
                    author: event.senderID,
                    messageID: info.messageID,
                    type: 'listCMD',
                    dcmm: Reply.dcmm,
                    nhóm: nhóm[0]
                });
            });
        } else if (type === 'listCMD') {
            const nhập = parseInt(event.body);
            const dcmm = new Map(JSON.parse(Reply.dcmm));
            const nhóm = dcmm.get(Reply.nhóm);
            if (isNaN(nhập) || nhập < 1 || nhập > nhóm.length) {
                return api.sendMessage('Vui lòng chọn số thứ tự hợp lệ.', event.threadID);
            }
            const clmm = nhóm[nhập - 1];
            let msg = `Thông tin chi tiết về lệnh:\n\n`;
            msg += `Tên lệnh: ${clmm.name}\n`;
            msg += `Mô tả: ${clmm.description}\n`;
            msg += `Tác giả: ${clmm.credits}\n`;
            msg += `Nhóm: ${clmm.Group}\n`;
            msg += `Cách sử dụng: ${clmm.usage}\n`;
            api.sendMessage(msg, event.threadID);
        }
    }
};
