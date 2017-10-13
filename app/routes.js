var mongoose = require('mongoose');
var Call = require('./models/call');
var User = require('./models/user');
var Home = require('./models/home');

var fs = require('fs');
var formidable = require('formidable');
var prId = "cf095489-7209-4b32-805e-29fd529aae2d";
var timestamp = require("unix-timestamp");
//var exflash = require('express-flash')
var path = require('path');

// var multiparty = require('multiparty');
var format = require('util').format;

var moment = require('moment');

var testCall  = {
    audioSrc: "http://cdndl.zaycev.net/900727/4528100/Arilena+Ara_-_Nentori+%28Beverly+Pills+Remix%29.mp3",
    loc: ["55.922419", "37.538251"],
    text: "Избили человека",
    date: 1234567890,
    type: "police"
}

module.exports = function(app, passport) {

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });



    app.get('/', isLoggedIn, function(req, res) {
        res.redirect('/claims')
    });



    app.get('/claims', isLoggedIn, function (req,res) {
        Call.find({}, function (err,calls) {
            if (err) throw(err);
            res.render('calls.ejs', {calls: calls, user: req.user});
        })
    });

app.post('/api/buildings', function (req, res) {
      var data = req.body;
      console.log(data)
      if (data.pos == undefined) {
        res.send('Нет позиции')
      }
      if (data.pos.lat == undefined) {
        res.send('Нет долготы')
      }
      if (data.pos.lon == undefined) {
        res.send('Нет ширины')
      }
      if (data.name == undefined) {
        res.send('Нет имени задания')
      }
      var home = new Home({
            pos: [data.pos.lat, data.pos.lon],
            photo: data.photo,
            name: data.name,
            description: data.description,
            created_at: Date.now(),
            status: 'created'
        });
        home.save(function(err, home) {
          if(err) {
            res.json({
              status: 'failed'
            })
            return;
          }
          res.json(home)
        })
    });

app.get('/testapi/buildings', function(req,res){

    var home = new Home({
        pos: [55.826637, 49.103777],
        photo: "https://pp.userapi.com/c638721/v638721822/51f53/js5ppnS4hpM.jpg",
        name: "Тут адрес от geolocate()",
        description: "Описание",
        status: 'На рассмотрении'
    });
    home.save(function(err, home) {
      if(err) {
        res.json({
          status: 'failed'
        })
        return;
      }
      res.json(home)
    })
})
app.get('/home', function(req, res) {
  var center = [55.820489, 49.069847];
  var max = 5000000;
  var query = req.query;
  var squery = {}
  if (query.status) {
    squery.status = query.status;
    console.log(squery)
    res.send(squery)
  }
  if (query.radius) {
    var radius = query.radius;
    max = radius;
  }
  if (query.lat && query.lon) {
    var lat = query.lat;
    var lon = query.lon;
    center = [query.lat, query.lon];
  }

  squery.pos = {
    "$near" :
      {
        "$geometry": { type: "Point",  coordinates: center },
        "$maxDistance": max
      }
  }
  console.log(squery);
  Home.find(squery, function(err, homes) {
      if(err) {console.log(err); return}
      var homeMap = {};
      if (homes != undefined) {
        homes.forEach(function(home) {
          var outputDeed = {
            pos: {lat: home.pos[0], lon: home.pos[1]},
            photo: home.photo,
            name: home.name,
            description: home.description,
            created_at: home.created_at,
            status: home.status
          }
        homeMap[home._id] = outputDeed;
      });
      } else {
        res.send("0 Результатов")
      }
      
    res.json(homeMap);  
    })
})



    app.get('/map', function(req, res) {
        res.render('map.ejs', {user: req.user})
    })

    app.post('/claims', function (req,res) {
        var data = req.body;
         var newCall = new Call();
         newCall.loc = [data.lat, data.lng];
         newCall.audioSrc = data.src;
         newCall.type = data.type;
         newCall.status = "Ожидает";
         newCall.text = data.text;
         newCall.date = Math.floor(Date.now() / 1000);
         newCall.save(function(err,doc){
            res.send(doc);
         })
    });

    app.get('/audio', isLoggedIn, function(req,res) {
        var pbx_id = req.query.id;

        Call.findOne({"pbx_call_id": pbx_id}, function (err,call) {

            if (!call.src) {
                return;
            }
            var stat = fs.statSync(call.src);

            res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': stat.size
            });

            var readStream = fs.createReadStream(call.src);
            readStream.pipe(res);
            });
    })



    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/claims',
        failureRedirect : '/login',
        failureFlash : true
    }));



    app.get('/workers', isLoggedIn,  function(req, res) {
        User.find({}, function (err, docs) {
            res.render('workers.ejs', {user: req.user, users: docs});
        });
    });



    app.post('/user', isLoggedIn, function(req, res) {

        var data = req.body;
        var newUser = new User();
        console.log(data);

        newUser.local.email = data.email;
        newUser.local.new = 1;
        newUser.local.password = newUser.generateHash(data.password);
        newUser.local.created = Date.now();
        newUser.local.address = data.address;
        newUser.local.skype = data.skype;
        newUser.local.viber = data.viber;
        newUser.local.phone = data.phone;
        newUser.profile.fname = data.fname;
        newUser.profile.sname = data.sname;
        newUser.profile.jobtitle = data.jobtitle;

        console.log(newUser);

        newUser.save(function(err) {
            if (err)
                throw err;
            res.writeHead(200);
            res.end('ok')
        });
    });


    app.put('/workers', isLoggedIn, function(req, res) {
        console.log(req.body);
    })


    app.get('/adduser', isLoggedIn, function(req, res) {
        res.render('addw.ejs', {user: req.user})
    })

    app.get('/edituser', isLoggedIn, function(req, res) {
        var id = req.query.id;
        User.findOne({ _id:id}, function(err, user) {


            res.render('edituser.ejs', {euser: user, user : req.user})
        })
    })


    app.post('/edituser', isLoggedIn, function(req, res) {
        var id = req.query.id;
        var data = req.body;

        var clUser = new User();

        User.findOne({ _id: id}, function(err, user) {

            user.profile.jobtitle = data.jobtitle;
            user.profile.fname = data.fname;
            user.profile.sname = data.sname;
            user.local.phone = data.phone;
            user.local.email = data.email;
            user.profile.comment = data.comment;
            user.profile.address = data.address;
            user.profile.skype = data.skype;
            user.profile.viber = data.viber;

            if (data.password) {
                var clUser = new User();
                user.local.password = clUser.generateHash(data.password);
            }

            user.save();
            res.writeHead(200)
            res.end('ok');
        })
    })



    app.get('/deleteuser', isLoggedIn, function(req, res) {
        var id = req.query.id;
        User.remove({ _id: id}, function(err, user) {
            res.redirect('/workers');
        })
    })



    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())  {
        return next();
    }
    res.redirect('/login');
}
