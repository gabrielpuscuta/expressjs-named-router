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