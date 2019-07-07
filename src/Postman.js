const fs = require('fs');
const path = require('path');

var routes = null;
var middlewares = null;
var config = null;

function Route(name, route){
    this.name = name;
    this.route = route;
    this.headers = [
        {
            "key": "Content-Type",
            "name": "Content-Type",
            "value": "application/json",
            "type": "text"
        }
    ];
}

Route.prototype.getHeaders = function(){
    this.setRouteHeaders();
    this.setMiddlewareHeaders();
    return this.headers;
};

Route.prototype.headerExists = function(key){
    for(j=0; j<this.headers.length; j++){
        if(this.headers[j].key === key){
            return true;
        }
    }
    return false;
};

Route.prototype.setRouteHeaders = function(){
    if(this.route.headers){
        for(var x=0; x<this.route.headers.length; x++){
            var routeHeader = this.route.headers[x];
            if(config.headers[routeHeader.key] !== undefined){
                routeHeader.value = config.headers[routeHeader.key];
            }

            if(!this.headerExists(routeHeader.key)){
                this.headers.push(routeHeader);
            }
        }
    }
};

Route.prototype.setMiddlewareHeaders = function(){
    for(var m=0; m<this.route.middleware.length; m++){
        
        var mw = this.getMiddleware(this.route.middleware[m]);
        if(!mw){
            continue;
        }
        
        var headers = (mw.config !== undefined && mw.config.headers !== undefined ? mw.config.headers : null);
        
        if(!headers){
            continue;
        }
        
        for(var h=0; h<headers.length; h++){

            var theHeader = headers[h];

            if(config.headers[theHeader.key] !== undefined){
                theHeader.value = config.headers[theHeader.key];
            }
            
            if(!this.headerExists(theHeader.key)){
                this.headers.push(theHeader);
            }
        }

    }
};

Route.prototype.getBodyParameters = function(){
    if(!this.route.parameters){
        return null;
    }
    
    if(this.route.parameters.input !== undefined){
        return JSON.stringify(this.route.parameters.input, null, 4);
    }
    return null;
};

Route.prototype.getOutput = function(){
    return {
        "name": this.route.title,
        "request": {
            "description": this.route.description,
            "method": this.route.method,
            "header": this.getHeaders(),
            "body": {
                "mode": "raw",
                "raw": this.getBodyParameters()
            },
            "url": {
                "raw": config.host+this.route.route,
                "host": [config.host],
                "path": [this.route.route.replace(/^\/+/g, '')],
            }
        },
        "response": []
    };
};

Route.prototype.getMiddleware = function(name){
    return (middlewares[name] !== undefined ? middlewares[name] : null);
};

function exportCollection(){
    var output = {
        info: {
            "name": config.appName,
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
            "exported_at": new Date(),
        },
        item: []
    };
    for(let name in routes){
        var route = new Route(name, routes[name]);
        output.item.push(route.getOutput());
    }

    fs.writeFile(path.resolve('postman_collection.json'), JSON.stringify(output, null, 4), function(err){
        if(err){
            reject(err);
        }
        console.log('Routes collection were exported to Postman successfully!');
    });
}

function exportEnvironment(){
    var exportedAt = new Date();
    var output = {
        "name": config.appName,
        "exported_at": exportedAt,
        "values": Object.keys(config.environment || []).map(function(key){
            var item = config.environment[key];
            
            var value = "";
            var description = "";
            
            if(typeof item === "object"){
                value = item.value || "";
                description = item.description || "";
            }
            else{
                value = item;
            }
            
            return {
                "key": key,
                "value": value,
                "description": description,
                "enabled": true
            };
        }),
        "_postman_variable_scope": "environment",
	"_postman_exported_at": exportedAt,
	"_postman_exported_using": "expressjs-named-routes"
    };
    
    fs.writeFile(path.resolve('postman_environment.json'), JSON.stringify(output, null, 4), function(err){
        if(err){
            reject(err);
        }
        console.log('Routes environment was exported to Postman successfully!');
    });
}

module.exports = function(r, m, c){
    routes = r;
    middlewares = m;
    config = c;
    
    return {
        export: function(){
            exportCollection();
            exportEnvironment();
        }
    };
};