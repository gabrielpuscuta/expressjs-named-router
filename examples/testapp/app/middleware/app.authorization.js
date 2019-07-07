module.exports = function(router){
    return function(req, res, next){
        //return res.send('App is not authorized');
        //authorize your app
        next();
    }
};

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