/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name:Christine Ang Student ID: 121559223 Date: November 19, 2023
*
* Published URL: ___________________________________________________________
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();
const path = require("path");

const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

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

app.get('/lego/addSet', async(req,res)=>{
    try{
        const themeData = await legoData.getAllThemes();
        res.render('addSet', { themes: themeData });
    }catch(err){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: \n${err}`});
    }
})

app.post('/lego/addSet', async(req, res)=>{
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


app.get('/lego/editSet/:num', async(req, res)=>{
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

app.post('/lego/editSet', async(req, res) =>{
    try{
        const setNum = req.body.set_num;
        const setData = req.body; 
        await legoData.editSet(setNum, setData);
        res.redirect('/lego/sets');
    }catch(err){
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get('/lego/deleteSet/:num', async(req,res) =>{
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

legoData.initialize().then(()=>{
    app.listen(HTTP_PORT, ()=>{
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  }).catch(err=>{
    console.log("ERROR: UNABLE TO START THE SERVER");
});
  