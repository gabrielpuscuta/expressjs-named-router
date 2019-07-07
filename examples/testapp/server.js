const express = require('express');
const app = express();
const server = require('http').createServer(app);

const host = '127.0.0.1';
const port = 3000;

//var router = require('express-router');
const router = require('../../index');
app.use(router({
    baseUrl: "http://"+host+":"+port,
    directories: {
        routes: "app/routes",
        middlewares: "app/middleware"
    },
    postman: {
        appName: 'MyAppName',
        host: "{{myAppName.env.host}}",
        headers: {
            "Content-Type": "application/json",
            "User-Access-Token": "{{myAppName.user.token}}",
        },
        environment: {
            "myAppName.env.host": {
                "value": "http://"+host+":"+port,
                "description": "Host"
            },
            "myAppName.app.token": "",
            "myAppName.user.token": "",
        }
    }
},{/* options to pass in controller */}));

console.log(router.collections.routes());
console.log(router.collections.middlewares());


router.exportToPostman();


server.listen(port,host,function() {
    console.log('Server was started on http://%s:%s running on worker: %s', server.address().address, server.address().port , process.pid);
});