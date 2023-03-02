//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const encrypt = require('mongoose-encryption');
//const md5 = require("md5");
const bcrypt = require('bcrypt');
const session = require('express-session');
//const passport= require("passport");
//const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const passportLocalMongoose = require("passport-local-mongoose");
const MongoDBSession = require('connect-mongodb-session')(session);



//For bcrypt
const saltRounds = 10;
const mongoURI = 'mongodb+srv://Gorka1234:Gorka2002@cluster0.wxufc8u.mongodb.net/?retryWrites=true&w=majority'


const app = express();

mongoose.set('strictQuery', true);

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(mongoURI).then(() => {console.log("MONGODB CONNECTED!")});
}



const store = new MongoDBSession({
    uri: mongoURI,
    collection: "MySessions",
});


var items = [];

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));



app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    store: store,  
}));

// app.use(passport.initialize());
// app.use(passport.session());







const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});




const User = new mongoose.model("User",userSchema);

// passport.serializeUser((user, done) => {
//     done(null, user.id);
//     });
//     passport.deserializeUser((id, done) => {
//     User.findById(id).then((user) => {
//     done(null, user);
//     });
//     });


    // passport.use(
    //     new GoogleStrategy({
    //     // options for google strategy
    //     clientID: process.env.CLIENTID ,
    //     clientSecret:process.env.CLIENTSECRET,
    //     callbackURL: '/auth/google/secrets'
    //     }, (accessToken, refreshToken, profile, done) => {
    //     // check if user already exists in our own db
    //     User.findOne({googleId: profile.id}).then((currentUser) => {
    //     if(currentUser){
    //     // already have this user
    //     console.log('user is: ', currentUser);
    //     done(null, currentUser);
    //     } else {
    //     // if not, create user in our db
    //     new User({
    //     _id: new mongoose.Types.ObjectId(),
    //     googleId: profile.id,
    //     name: profile.displayName,
    //     email:profile._json.email
    //     }).save().then((newUser) => {
    //     console.log('created new user: ', newUser);
    //     done(null, newUser);
    //     });
    //     }
    //     });
    //     })
    //     );





const isAuth = (req,res,next) => {
    if(req.session.isAuth){
        next()
    }else{
        res.redirect("login");
    }
}

app.get("/",function(req,res){
    console.log(req.session);
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

//COOKIES NOT WORKING
app.get("/secrets", isAuth, (req,res) => {
    res.render("secrets");
});



app.post("/register",function(req,res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        
        newUser.save(function(err,result){
            if(!err){
                res.render("secrets");
            }else{
                console.log(err);
                res.redirect("login");
            }
        })
    });

});



app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username})
    .then((foundUser) => {
        if(foundUser){
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if(result==true){
                    req.session.isAuth=true;
                    res.redirect("secrets");
                }
            }); 
        }
   })
   .catch((error) => {
       //When there are errors We handle them here.
       res.send(400, "Bad Request");
   });
      
});




















app.listen(3000, function(){
    console.log("Server started on port 3000");
});


  



 // User.register({username:req.body.username},req.body.password,function(err,user){
    //     if(err){
    //         console.log(err);
    //         res.redirect("/register");
    //     }else{
    //         const authenticate = User.authenticate();
    //         authenticate('username', 'password', function(err, result) {
    //             if (err) { console.log(err);}
    //             else{
    //                 res.render("secrets");
    //                 req.session.isAuth() = true;
    //             }
    //              Value 'result' is set to false. The user could not be authenticated since the user is not active
    //           });
                
    //     }
    // });