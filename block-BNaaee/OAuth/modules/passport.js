var passport = require('passport'),
 GitHubStrategy = require('passport-github2').Strategy,
 GoogleStrategy = require('passport-google-oauth20').Strategy;

var User = require('../models/User');

// github passport

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback",
    scope: ['user:email']
},
    async (accessToken, refreshToken, profile, cb) => {
        var profileData = {
            name: profile._json.name,
            email: profile.emails[0].value,
        };
        try {
            const user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                const addedUser = await User.create(profileData);
                return cb(null, addedUser);
            }
            return cb(null, user);
        } catch (error) {
            return cb(error);
        }
    }
));

//google passport

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback' 
},
    async (accessToken, refreshToken, profile, cb) => {
        const newUser = {
            email: profile.emails[0].value,
            name: profile.name.familyName,
        }
        try {
            const user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                const addedUser = await User.create(profileData);
                return cb(null, addedUser);
            }
            return cb(null, user);
        } catch (err) {
            console.error(err);
        }
    }));
    

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(function (id, done) {
        User.findById(id, "name email username", function (err, user) {
            done(err, user);
        });
    });