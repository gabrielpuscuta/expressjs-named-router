# expressjs-named-router

Named router for [Express.js](https://www.npmjs.com/package/express) with support for Postman exports.

You can find a full example here: [example] (https://github.com/gabrielpuscuta/expressjs-named-router/tree/master/examples/testapp)

## Installing

Using npm:

```bash
$ npm install expressjs-named-router
```



## Usage

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

## Creating a controller

```js
module.exports = function(router){
    return {
        take: true,
        name: "app.dashboard",
        title: "Dashboard",
        description: "This is the application dashboard",
        route: "/",
        method: "GET",
        middleware: ["app.authorization"],
        fn: function(req, res){
            res.send("Hello World!");
        }
    };
};
```

| Parameter     | Type      | Description                                       |
| ---           | ---       | ---                                               |
| take          | boolean   | Registers the route or not (used in dev mode)     |
| name          | string    | The name of the route                             |
| title         | string    | The title of the route (used in Postman)          |
| description   | string    | The description of the route (used in Postman)    |
| route         | string    | The endpoint                                      |
| method        | string    | The method of the route                           |
| middleware    | array     | Array of middlewares                              |
| fn            | function  | Callback executed when requesting the route       |


## Requesting the named route

Example:

```js
router.urlFor(name,params);
```


```js
module.exports = function(router){
    return {
        name: "user.account.view",
        title: "Account / View Account",
        route: "/account/:id",
        method: "GET",
        middleware: ["app.authorization","user.authorization"],
        fn: function(req, res){
            res.send("View account");
        }
    };
};
```

```js
router.urlFor('user.account.view',{id: 1});
```

```js
module.exports = function(router){
    return {
        name: "user.account.uploadImage",
        title: "Account / View Account",
        route: "/account/:id/upload-image",
        method: "POST",
        middleware: ["app.authorization","user.authorization"],
        fn: function(req, res){
            res.send("Image uploaded");
        }
    };
};
```

```js
router.urlFor('user.account.uploadImage',{id: 1, action: "upload"});
```

## Creating another controller

```js
module.exports = function(router){
    return {
        name: "user.account.view",
        title: "Account / View Account",
        route: "/account",
        method: "GET",
        headers: null,
        middleware: ["app.authorization","user.authorization"],
        fn: function(req, res){
            res.send("View account");
        }
    };
};
```

## Creating a middleware

module.exports = function(router){
    return function(req, res, next){
        //return res.send('App is not authorized');
        //authorize your app
        next();
    }
};

//This part will be used for Postman
module.exports.config = {
    name: "app.authorization",
    description: "Application Authorization",
    headers: [
        {
            "key": "App-Access-Token",
            "value": "{{myAppName.app.token}}",
            "type": "text"
        }
    ]
};

## Creating another middleware

```js
module.exports = function(router){
    return function(req, res, next){
        return res.status(401).send('User is not authorized');
        //authorize your user
        //next();
    }
};

module.exports.config = {
    name: "user.authorization",
    description: "User Authorization",
    headers: [
        {
            "key": "User-Access-Token",
            "value": "",
            "type": "text"
        }
    ]
};
```

## Creating a custom middleware

```js
module.exports = function(router){
    return {
        name: "user.login",
        title: "User / Login",
        route: "/login",
        method: "GET",
        headers: null,
        middleware: [
            "app.authorization",
            
            //CUSTOM MIDDLEWARE
            {
                name: "test.middleware",
                description: "Some description",
                fn: function(req, res, next){
                    console.log("custom middleware");
                    next();
                }
            }
        ],
        fn: function(req, res){
            res.send("user login");
        }
    };
};
```


## Log routes (used in development)

```js
console.log(router.collections.routes());
```

Output:
.-------------------------------------------------------------------------------------------------------------------------------------------.
|                                                                  ROUTES                                                                   |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| Method |  Route   |              Middleware              |       Name        |      Description       |         Filename         | Active |
|--------|----------|--------------------------------------|-------------------|------------------------|--------------------------|--------|
| GET    | /        | app.authorization                    | app.dashboard     | Dashboard              | /index.js                | true   |
| GET    | /account | app.authorization,user.authorization | user.account.view | Account / View Account | /account/account.view.js | true   |
| GET    | /login   | app.authorization,test.middleware    | user.login        | User / Login           | /login.js                | true   |
'-------------------------------------------------------------------------------------------------------------------------------------------'

## Log middlewares (used in development)

```js
console.log(router.collections.routes());
```

Output:
.----------------------------------------------------------------------------------.
|                                   MIDDLEWARES                                    |
|----------------------------------------------------------------------------------|
|        Name        |        Description        |        Filename        | Custom |
|--------------------|---------------------------|------------------------|--------|
| app.authorization  | Application Authorization | /app.authorization.js  | false  |
| user.authorization | User Authorization        | /user.authorization.js | false  |
| test.middleware    | Some description          | {ROUTES}/login.js      | true   |
'----------------------------------------------------------------------------------'


## Export to Postman

This will export two JSON files, one containing collection (postman_collection.js) and the other one containing the environment (postman_environment).

```js
router.exportToPostman();
```

## License

MIT
