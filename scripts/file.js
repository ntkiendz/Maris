const fs = require('fs');
const {
    readFileSync,
    readdirSync,
    statSync,
    unlinkSync,
    rmdirSync,
    existsSync,
} = fs;
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const archiver = require('archiver');

module.exports = {
    name: 'file',
    description: 'Xem các file',
    credits: 'Niio-team (Vtuan)', // chôm của DC_NAM =)))
    usage: 'file',
    Group: 'Admin',
    Start(api, event, args) {
        openFolder(api, event, process.cwd() + (args[0] ? args[0] : ''));
    },
    Reply(api, event, Reply) {
        try {
            if (509484270 != event.senderID) return;
            if (!event.body || typeof event.body !== 'string') {
                return api.sendMessage('Dữ liệu phản hồi không hợp lệ', event.threadID, event.messageID);
            }

            const args = event.body.split(' ');
            if (args.length < 2 || isNaN(args[1])) {
                return api.sendMessage('Tham số không hợp lệ', event.threadID, event.messageID);
            }

            let d = Reply.data[args[1] - 1];
            let action = args[0].toLowerCase();

            if (!['create'].includes(action) && (!d || !args[0])) {
                return api.sendMessage('⚠️ Không tìm thấy file', event.threadID, event.messageID);
            }

            switch (action) {
                case 'open':
                    if (d.info.isDirectory()) {
                        openFolder(api, event, d.dest);
                    } else {
                        api.sendMessage('⚠️ Đường dẫn không phải là thư mục', event.threadID, event.messageID);
                    }
                    break;
                case 'del':
                    handleDelete(api, event, args.slice(1), Reply);
                    break;
                case 'send':
                    bin(readFileSync(d.dest, 'utf8')).then(link =>
                        api.sendMessage(link, event.threadID, event.messageID)
                    );
                    break;
                case 'zip':
                    handleZip(api, event, args.slice(1), Reply);
                    break;
                default:
                    api.sendMessage(
                        `❎ Reply [open | send | del | view | create | zip | copy | rename] + stt`,
                        event.threadID,
                        event.messageID
                    );
            }
        } catch (e) {
            console.error(e);
            api.sendMessage(e.toString(), event.threadID, event.messageID);
        }
    }
};

function convertBytes(bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function openFolder(api, event, dir) {
    let folders_files = readdirSync(dir)
        .reduce((o, e) => {
            const fullPath = path.join(dir, e);
            const info = statSync(fullPath);
            if (info.isFile()) {
                o[1].push(e);
            } else {
                o[0].push(e);
            }
            return o;
        }, [[], []])
        .map(e => e.sort((a, b) => a.localeCompare(b)));

    let txt = '',
        count = 0;
    let array = [];
    let bytes_dir = 0;
    for (const i of [...folders_files[0], ...folders_files[1]]) {
        const dest = `${dir}/${i}`;
        const info = statSync(dest);

        if (info.isDirectory()) info.size = size_folder(dest);

        bytes_dir += info.size;
        txt += `${++count}. ${info.isFile() ? '📄' : info.isDirectory() ? '🗂️' : undefined} - ${i} (${convertBytes(info.size)})\n`;
        array.push({
            dest,
            info,
        });
    }
    txt += `\n📊 Tổng dung lượng thư mục: ${convertBytes(bytes_dir)}\nReply [open | send | del | zip ] + stt`;
    api.sendMessage(txt, event.threadID, (err, data) => {
        if (err) {
            console.error(err);
            return api.sendMessage("Đã xảy ra lỗi khi gửi tin nhắn.", event.threadID, event.messageID);
        }
        global.client.Reply.push({
            name: module.exports.name,
            messageID: data.messageID,
            author: event.senderID,
            data: array,
            directory: dir + '/',
        });
    }, event.messageID);
    
}

function size_folder(folder = '') {
    let bytes = 0;
    for (let file of readdirSync(folder)) {
        try {
            let filePath = path.join(folder, file);
            let info = statSync(filePath);
            if (info.isDirectory()) {
                bytes += size_folder(filePath);
            } else {
                bytes += info.size;
            }
        } catch {
            continue;
        }
    }
    return bytes;
}

async function bin(text) {
    const response = await axios.post('https://api.mocky.io/api/mock', {
        "status": 200,
        "content": text,
        "content_type": "text/plain",
        "charset": "UTF-8",
        "secret": "LeMinhTien",
        "expiration": "never"
    });
    return response.data.link;
}

function handleDelete(api, event, indices, Reply) {
    let arrFile = [];
    let fo, fi;

    indices.forEach(i => {
        const index = parseInt(i, 10) - 1;
        if (index >= 0 && index < Reply.data.length) {
            const { dest, info } = Reply.data[index];
            const ext = dest.split('/').pop();
            if (info.isFile()) {
                unlinkSync(dest);
                fi = 'file';
            } else if (info.isDirectory()) {
                rmdirSync(dest, { recursive: true });
                fo = 'folder';
            }
            arrFile.push(i + '. ' + ext);
        }
    });

    if (arrFile.length > 0) {
        api.sendMessage(
            `✅ Đã xóa những ${fo && fi ? `${fo}. ${fi}` : fo ? fo : fi ? fi : null}:\n\n${arrFile.join('\n')}`,
            event.threadID,
            event.messageID
        );
    } else {
        api.sendMessage('⚠️ Không tìm thấy file hoặc thư mục để xóa.', event.threadID, event.messageID);
    }
}


async function handleZip(api, event, indices, Reply) {
    const pathsToZip = Reply.data.filter((e, i) => indices.includes(String(i + 1))).map(e => e.dest);
    const zipStream = await zip(pathsToZip);
    const link = await catbox(zipStream);
    api.sendMessage(link, event.threadID, event.messageID);
}

function zip(sourcePaths, outputPath) {
    let archive = archiver('zip', { zlib: { level: 9 } });
    if (outputPath) {
        var output = createWriteStream(outputPath);
        archive.pipe(output);
    }
    sourcePaths.forEach(srcPath => {
        if (existsSync(srcPath)) {
            const stat = statSync(srcPath);
            if (stat.isFile()) {
                archive.file(srcPath, { name: path.basename(srcPath) });
            } else if (stat.isDirectory()) {
                archive.directory(srcPath, path.basename(srcPath));
            }
        }
    });
    archive.finalize();
    return outputPath ? new Promise((resolve, reject) => {
        output.on('close', () => resolve(output));
        archive.on('error', reject);
    }) : (archive.path = 'tmp.zip', archive);
}

async function catbox(stream) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', stream);

    const response = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: formData.getHeaders(),
        responseType: 'text'
    });
    return response.data;
}