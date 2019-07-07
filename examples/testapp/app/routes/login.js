module.exports = function(){
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