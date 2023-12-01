/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name:Christine Ang Student ID: 121559223 Date: November 18, 2023
*
* Published URL: https://web322-assignment4.cyclic.app/
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service.js");
const clientSessions = require("client-sessions");

const express = require('express');
const app = express();
const path = require("path");


const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));


app.use(
    clientSessions({
      cookieName: 'session', // this is the object name that will be added to 'req'
      secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
      duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
      activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
    })
);

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect('/login');
    } else {
      next();
    }
 }

 app.get("/login",(req,res)=>{
    res.render("login");
 });

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
   try{
        authData.registerUser(req.body);
        res.render("register",{successMessage:"User created"});
    }catch(err){
        res.render("register",{errorMessage: err, userName: req.body.userName});
    }
})

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/lego/sets');
        }).catch((err) => {
            console.log(err);
            res.render("login", { message: `${err}`, userName: req.body.userName });
        });
});

app.get("/logout",(req,res)=>{
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req,res)=>{
    res.render("userHistory");
})

//--


app.get("/", (req,res)=>{
    res.render("home");
})

app.get("/about", (req,res)=>{
    res.render("about");
})

app.get("/404", (req,res)=>{
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
})

app.get('/lego/sets', async (req, res) => {
    try {
        let theme = req.query.theme;
        if (theme) {
            let setByTheme = await legoData.getSetsByTheme(theme);
            res.render("sets", {sets: setByTheme});
        } else {
            const allSets = await legoData.getAllSets();
            res.render("sets", {sets: allSets});
        }
    } catch (err) {
        res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
    }
});

app.get('/lego/addSet', ensureLogin, async(req,res)=>{
    try{
        const themeData = await legoData.getAllThemes();
        res.render('addSet', { themes: themeData });
    }catch(err){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}`});
    }
})

app.post('/lego/addSet', ensureLogin, async(req, res)=>{
    try{
        const setData = req.body; 
        await legoData.addSet(setData);
        res.redirect('/lego/sets');
    }catch(err){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})

app.get('/lego/sets/:setNum', async (req, res)=>{
    try{
        const idSet = req.params.setNum; 
        if(idSet){
            let setByNum = await legoData.getSetByNum(idSet);
            res.render("set", {set: setByNum});
        }
        else{
            res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
        }
    }catch(err){
        res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
    }
});

app.get('/lego/editSet/:num', ensureLogin, async(req, res)=>{
    try{
        const setNum = req.params.num; 
        if(setNum){
            let set = await legoData.getSetByNum(setNum);
            let themes = await legoData.getAllThemes(); 
            res.render("editSet", {set, themes});
        }
    }catch(err){
        res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
    }
});

app.post('/lego/editSet', ensureLogin, async(req, res) =>{
    try{
        const setNum = req.body.set_num;
        const setData = req.body; 
        await legoData.editSet(setNum, setData);
        res.redirect('/lego/sets');
    }catch(err){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get('/lego/deleteSet/:num', ensureLogin, async(req,res) =>{
    try{
        const setNum = req.params.num; 
        if(!setNum){
            throw new Error('Invalid set number provided.');
        }
        await legoData.deleteSet(setNum);
        res.redirect('/lego/sets');
    }catch(err){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
})

app.get('*', (req, res) => {
    res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
    console.log(`app listening on: ${HTTP_PORT}`);
    });
}).catch(function(err){
    console.log(`unable to start server: ${err}`);
});
  