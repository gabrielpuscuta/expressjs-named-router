# expressjs-named-router

Named router for [Express.js](https://www.npmjs.com/package/express)

## Installing

Using npm:

```bash
$ npm install expressjs-named-router
```

## Example

```js
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const host = '127.0.0.1';
const port = 3000;

var router = require('express-router');
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

if(process.env === "DEV"){
    console.log(router.collections.routes());
    console.log(router.collections.middlewares());


    router.exportToPostman();
}

server.listen(port,host,function() {
    console.log('Server was started on http://%s:%s running on worker: %s', server.address().address, server.address().port , process.pid);
});
```

## License

MIT
