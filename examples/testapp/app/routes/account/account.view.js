module.exports = function(){
    return {
        name: "user.account.view",
        title: "Account / View Account",
        route: "/account",
        method: "GET",
        headers: null,
        middleware: ["app.authorization","user.authorization"],
        fn: function(req, res){
            res.send();
        }
    };
};