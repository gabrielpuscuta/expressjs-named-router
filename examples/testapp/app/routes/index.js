module.exports = function(router){
    return {
        take: true,
        name: "app.dashboard",
        title: "Dashboard",
        description: "Application Dashboard",
        route: "/",
        method: "GET",
        middleware: ["app.authorization"],
        fn: function(req, res){
            res.send(router.urlFor('user.login'));
        }
    };
};