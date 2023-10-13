/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: _Christine Ang_ Student ID: _121559223_ Date: Occtober 12, 2023
*
********************************************************************************/


const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();
const path = require("path");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname,"/views/home.html"));
})

app.get("/about", (req,res)=>{
    res.sendFile(path.join(__dirname,"/views/about.html"));
})

app.get("/404", (req,res)=>{
    res.sendFile(path.join(__dirname,"views/404.html"));
})

app.get('/lego/sets', async (req, res) => {
    try {
        let theme = req.query.theme;
        
        if (theme) {
            let setByTheme = await legoData.getSetsByTheme(theme);
            res.send(setByTheme);
        } else {
            const allSets = await legoData.getAllSets();
            res.send(allSets);
        }
        
    } catch (err) {
        res.status(404).sendFile(path.join(__dirname,"views/404.html"));
    }
});


app.get('/lego/sets/:setNum', async (req, res)=>{

    try{
        const idSet = req.params.setNum; 
    
        if(idSet){
            console.log(idSet);
            let setByNum = await legoData.getSetByNum(idSet);
            res.send(setByNum);
        }
        else{
            res.status(404).sendFile(path.join(__dirname,"views/404.html"));
        }

    }catch(err){
        res.status(404).sendFile(path.join(__dirname,"views/404.html"));
    }
})

legoData.initialize().then(()=>{
    app.listen(HTTP_PORT, ()=>{
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  }).catch(err=>{
    console.log("ERROR: UNABLE TO START THE SERVER");
  });
  