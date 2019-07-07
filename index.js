const fs = require('fs');
const path = require('path');
const pathToRegexp = require('path-to-regexp');

const express = require('express');
const expressRouter = express.Router({mergeParams: true});

var config = {};
var middlewares = {};
var customMiddlewares = {};
var routes = [];
var namedRoutes = {};

function routeCollector(dir, options){
    dir = path.resolve(dir);
    fs.readdirSync(dir).forEach(function(file){
        const filePath = path.resolve(path.join(dir, file));
        if(fs.statSync(filePath).isDirectory()){
            return routeCollector(filePath, options);
        }
        
        const route = require(filePath)(options);
        route.filename = path.join(dir, file).replace(config.directories.routesBaseDir, '');
        
        routes.push(route);
        namedRoutes[route.name] = pathToRegexp.compile(route.route);
    });
    routes.sort((a, b) => (a.route > b.route) ? 1 : -1);
    return routes;
};

function middlewareCollector(dir, options){
    dir = path.resolve(dir);
    fs.readdirSync(dir).forEach(function(file){
        const filePath = path.resolve(path.join(dir, file));
        if(fs.statSync(filePath).isDirectory()){
            return middlewareCollector(filePath, options);
        }
        var mw = require(filePath);
        middlewares[mw.config.name] = {
            config: Object.assign(mw.config,{
                filename: path.join(dir, file).replace(config.directories.middlewaresBaseDir, '')
            }),
            fn: mw(options)
        };
    });
    return routes;
};

function parseRouteMiddleware(route){
    if(!route.middleware){
        return [];
    }
    
    return route.middleware.map(function(name){
        if(typeof name === "object"){
            customMiddlewares[name.name] = {
                config: {name: name.name, description: name.description, filename: '{ROUTES}'+route.filename, custom: true},
                fn: name.fn,
            };
            return name.fn;
        }
        return middlewares[name].fn;
    });
};

function urlFor(name, params){
    if(namedRoutes[name] === undefined){
        return null;
    }
    
    try{
        return (config.baseUrl ? config.baseUrl : '')+namedRoutes[name](params);
    }
    catch(e){
        console.log(e);
    }
    
    return null;
};

module.exports = function(configuration, options){
    config = Object.assign(configuration, config);
    config.directories.routesBaseDir = path.resolve(config.directories.routes);
    config.directories.middlewaresBaseDir = path.resolve(config.directories.middlewares);
    
    options.urlFor = urlFor;
    
    middlewareCollector(config.directories.middlewares, options);
    
    routeCollector(config.directories.routes, options).map(function(item){
        if(item.take === false){
            return false;
        }
        var methods = item.method.toLowerCase().split(',');
        for(var i=0; i<methods.length; i++){
            var method = methods[i];
            var mws = parseRouteMiddleware(item);
            expressRouter[method](item.route, mws || '', item.fn);
        }
    });
    
    return expressRouter;
};

module.exports.collections = {
    routes: function(){
        console.log("BASEURL",config.baseUrl);
        const AsciiTable = require('ascii-table');
        const table = new AsciiTable('ROUTES');
        table.setHeading('Method', 'Route','Middleware','Name', "Description", "Filename","Active");
        routes.map(function(item){
            if(!item.middleware){
                item.middleware = [];
            }
            var mws = item.middleware.map(function(mw){
                if(typeof mw === 'object'){
                    return mw.name;
                }
                return mw;
            });
            var active = (item.take === false ? false : true);
            table.addRow(item.method.split(','), item.route, (mws.length > 0 ? mws : '-'), item.name, item.title, item.filename, active);
        });
        return table.toString();
    },
    middlewares: function(){
        const AsciiTable = require('ascii-table');
        const table = new AsciiTable('MIDDLEWARES');
        table.setHeading('Name', "Description", "Filename", "Custom");
        var middlewareList = Object.assign(middlewares, customMiddlewares);
        for(var name in middlewareList){
            var mw = middlewareList[name];
            table.addRow(mw.config.name, mw.config.description,mw.config.filename, mw.config.custom || false);
        }
        return table.toString();
    },
};

module.exports.exportToPostman = function(){
    const Postman = require('./src/Postman');
    var postman = new Postman(routes, middlewares, config.postman);
    return postman.export();
}