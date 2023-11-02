/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Christine Ang Student ID: 121559223 Date: November 3, 2023
*
* Published URL: https://web322-assignment3.cyclic.app/
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();
const path = require("path");


const HTTP_PORT = process.env.PORT || 8080;


app.set('view engine', 'ejs');

app.use(express.static("public"));

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
  