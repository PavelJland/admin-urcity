
module.exports = function(app, Com, Group, mongoose, Perm) {

    app.get('/settings', Perm.isLoggedIn, function(req, res) {

        if (req.query.method == "group") {
            var active = req.query.active;
            Com.findOne({"_id": mongoose.Types.ObjectId("59b153c20d50d6ee2657a4c9")}, function (err, doc) {
                Group.findOne({"name": req.query.active}, function (err, group) {
                    res.render('settings.ejs', {user: req.user, group: group, company: doc});
                })
            })
        } else {
            Com.findOne({"_id": mongoose.Types.ObjectId("59b153c20d50d6ee2657a4c9")}, function (err, doc) {
                res.render('settings.ejs', {user: req.user, company: doc});
            })
        }
    });
}
