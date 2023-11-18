require('dotenv').config();

const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
});

const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true, 
    },
    name: Sequelize.STRING
    },{
        createdAt: false, // disable createdAt
        updatedAt: false, // disable updatedAt
    }
);

const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts:Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url:Sequelize.STRING
    },{
        createdAt: false, // disable createdAt
        updatedAt: false, // disable updatedAt
    }
);

Set.belongsTo(Theme, {foreignKey: 'theme_id'})

function initialize(){   
    return new Promise(async (resolve, reject) => {
        try{
            await sequelize.sync(); 
            resolve();
        }catch(err){
            reject(err);
        }
    });
} 

function getAllSets(){
    return new Promise((resolve,reject)=>{
       Set.findAll({include: [Theme]}).then(data=>{
            resolve(data);
       }).catch(err=>{
            reject(`unable to find set`);
       })
    });
}

function getSetByNum(setNum) {
    return new Promise((resolve, reject) => {
        Set.findAll({
            where: { set_num: setNum },
            include: [Theme],
        }).then((sets) => {
            if (sets.length > 0) {
                resolve(sets[0]);
            } else {
                reject("ERROR: UNABLE TO FIND REQUESTED SET");
            }
        }).catch((error) => {
            reject(error); 
        });
    });
}

function getSetsByTheme(theme) {
    return new Promise((resolve, reject) => {
        Set.findAll({include: [Theme], 
            where: {'$Theme.name$': {[Sequelize.Op.iLike]: `%${theme}%`}
        }
        }).then((foundSets) => {
            if (foundSets.length > 0) {
                resolve(foundSets);
            } else {
                reject("ERROR: UNABLE TO FIND REQUESTED SETS");
            }
        }).catch((error) => {
            reject(error);
        });
    });
}

function getAllThemes() {
    return new Promise((resolve, reject) => {
      Theme.findAll().then((themes) => {
          resolve(themes);
        }).catch((err) => {
          reject(err);
        });
    });
}

function addSet(setData){
    return new Promise((resolve, reject) => {
        Set.create(setData).then(()=>{
            resolve();
        }).catch((err)=>{
            if(err.errors && err.errors.length > 0) {
                reject(err.errors[0].message)
            }else{
                reject('An error occurred while creating the set.');
            }
        })
    })
}
  
function editSet(setNum, setData){
    return new Promise((resolve, reject)=>{
        Set.update(setData, {where: {set_num: setNum}}).then(() => {
            resolve();
        }).catch((err)=>{
            reject(err.errors[0].message)
        })
    });
}

function deleteSet(set_num){
    return new Promise((resolve, reject)=>{
        Set.destroy({where:{set_num : set_num}}).then(()=>{
            resolve();
        }).catch((err)=>{
            reject(err.errors[0].message)
        })
    });    
       
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet};

