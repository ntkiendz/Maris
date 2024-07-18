const os = require('os');
const moment = require('moment-timezone');
const fs = require('fs').promises;
const nodeDiskInfo = require('node-disk-info');
const path = require('path');

const formatSize = (size) => {
    if (size < 1024) return `${size} B`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const getTotalSize = async (dirPath) => {
    let totalSize = 0;

    const calculateSize = async (filePath) => {
        try {
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
                totalSize += stats.size;
            } else if (stats.isDirectory()) {
                const fileNames = await fs.readdir(filePath);
                await Promise.all(fileNames.map(fileName => calculateSize(path.join(filePath, fileName))));
            }
        } catch (error) {
            console.error(`Error calculating size for ${filePath}:`, error);
        }
    };

    await calculateSize(dirPath);

    return totalSize;
};

module.exports = {
    name: 'upt',
    description: 'Xem time onl',
    credits: 'Niio-team (Vtuan)',
    Group: 'Admin',
    usage: 'upt',
    async Start(api, event, args) {
        const startPing = Date.now();
        const p = args[0] || './';
        try {
            const f = await fs.readdir(p);

            let t = 0;

            await Promise.all(f.map(async (n) => {
                const p2 = path.join(p, n);
                const s = await fs.stat(p2);

                if (s.isDirectory()) {
                    const ts = await getTotalSize(p2);
                    t += ts;
                } else {
                    t += s.size;
                }
            }));

            const getStatusByPing = (ping) => ping < 200 ? 'smooth' : ping < 800 ? 'average' : 'lag';

            const freeMemory = os.freemem();
            const usedMemory = process.memoryUsage().rss;
            const uptime = process.uptime();
            const [uptimeHours, uptimeMinutes, uptimeSeconds] = [
                Math.floor(uptime / 3600),
                Math.floor((uptime % 3600) / 60),
                Math.floor(uptime % 60)
            ];

            try {
            } catch (error) {
                console.error('❎ Error fetching user name:', error);
            }

            const botStatus = getStatusByPing(Date.now() - startPing);

            try {
                const disks = await nodeDiskInfo.getDiskInfo();
                const firstDisk = disks[0] || {};

                const convertToGB = (bytes) => bytes ? (bytes / (1024 * 1024 * 1024)).toFixed(2) + 'GB' : 'N/A';

                const pingReal = Date.now() - startPing;

                const replyMsg = `
🕒 ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss')} | 📅 ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
⌛ Uptime: ${uptimeHours.toString().padStart(2, '0')}:${uptimeMinutes.toString().padStart(2, '0')}:${uptimeSeconds.toString().padStart(2, '0')}
🔣 Bot status: ${botStatus}
🛢️ Free RAM: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB
🔍 Used RAM: ${(usedMemory / 1024 / 1024).toFixed(2)}MB
💾 Free storage: ${convertToGB(firstDisk.available)}
🛜 Ping: ${pingReal}ms
💾 Total File: ${formatSize(t)}
`.trim();

                api.sendMessage(replyMsg, event.threadID, event.messageID);
            } catch (error) {
                console.error('❎ Error getting disk information:', error.message);
            }
        } catch (error) {
            console.error('❎ Error reading directory:', error);
        }
    }
};
