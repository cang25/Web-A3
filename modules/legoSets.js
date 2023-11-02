const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize(){   
    return new Promise((resolve,reject)=>{
        for(let i = 0;  i < setData.length; i++){ 
            sets[i] = setData[i];
            for(let j = 0;  j < themeData.length; j++){
                if(sets[i].theme_id===themeData[j].id){
                    sets[i].theme = themeData[j].name;
                }
            }
        }
        resolve(); 
    })
    
} 

function getAllSets(){
    return new Promise((resolve,reject)=>{
        resolve(sets);
    })
}

function getSetByNum(setNum){

  
    return new Promise((resolve,reject)=>{
        let found = sets.find((element) => element.set_num === setNum);

        if(found){
            resolve(found);
        }
        else{
            reject("ERROR: UNABLE TO FIND REQUESTED SET");
        }
        
    })


};

function getSetsByTheme(theme){
    return new Promise((resolve,reject)=>{
        const found = sets.filter((element) => element.theme.toUpperCase().includes(theme.toUpperCase()));
        if(found.length > 0){
            resolve(found);
        }
        else{
            reject("ERROR: UNABLE TO FIND REQUESTED SET");
        }
    })
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
