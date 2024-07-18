const fs = require('fs');
const path = require('path');
const login = require('./controllers/fb-client');
const listen = require('./controllers/listen');

const appPath = path.resolve(__dirname, 'appData.json'); 
let appstate;

try {
    appstate = require(appPath);
    console.log('Đã tìm thấy và đọc được tệp appstate.json');
} catch (error) {
    console.error('Lỗi khi đọc appstate.json:', error);
    return;
}

login({ appState: appstate }, (e, api) => {
    if (e) return console.error('Login error:', e);

    fs.writeFileSync(appPath, JSON.stringify(api.getAppState(), null, "\t"));
    console.log('Đăng nhập thành công!');

    try {
        const main = require('./controllers/main');
        main(api);
    } catch (m) {
        console.error('Lỗi khi chạy main:', m);
    }

    api.listenMqtt((err, event) => {
        if (err) {
            return console.error('Lỗi:', err);
        }
        listen(api, event);
    });
});