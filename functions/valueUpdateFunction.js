async function update_password(){
    try{
    const bcrypt = require('bcrypt')
    const User = require('./models/user')
    const user = await User.findOne({member_id: "MFE1234567" })
    console.log(user)
    console.log(user.hash_password)
    // user.map(async(d) => {
    //     console.log(d)
        const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hashSync(user.hash_password, salt)
        console.log("😂😂😂😂😂", hash_password)
        const con = await User.updateOne({member_id: user.member_id}, {
            $set :{
                hash_password: hash_password                    
            }
        })
        console.log("after update password",con)
    // })
    } catch(error) {
        return error
    }
}
// 751015
// update_password() 
let startTime = Date.now();
let interval = 1000*60*15;
let first_time = true;
let skip = 10;
let limit = 1000;
setInterval(async()=>{
    if (Date.now() - startTime > interval || first_time) {
        startTime = Date.now();
        first_time = false;
        let done = await findtotalmemberAndDireactMember(skip, limit);
        skip += limit;
    }
}, 2000);

Array.prototype.countAllChilds = function() {
    let count = 0;
    this.map((d)=>{
        count += d?d.children?Array.isArray(d.children)?d.children.length:0:0:0;
    });
    return count;
}


async function findtotalmemberAndDireactMember(skip, limit){
  try{
    const { findChild } = require('./functions/incomFunctions');
    const User = require("./models/user");
    console.log("Start: ", new Date().toLocaleString())
    const user = await User.find({}).skip(skip).limit(limit);
    console.log("Hi Harshit Baba!")
    console.log(user.length);
    let count = user.length;
    let num = 0;
    // let bulk_obj = [];
    let all_data = user.map(async(d) => {
            try{
                const data = await findChild(d.member_id);
                // console.log("Data: ", ++num, " / ", count, data);
                if (data && data.length > 0) {
                console.log("🐱‍👤🐱‍👤🐱‍👤🐱‍👤🐱‍👤",d.member_id, data.length, data[0].children.length)
                    let obj =  { 
                        "updateOne" : {
                           "filter": { "member_id": d.member_id },
                           "update": {
                                "direct": data.length,
                                "total_child": data[0].children && data[0].children.length > 0 ?data[0].children.length:0,
                            }, 
                           "upsert": true,                 // Available starting in 4.2.1
                        },
                        
                     }
                    return obj;
                  } else {
                    let obj =  { 
                        "updateOne" : {
                           "filter": { "member_id": d.member_id },
                           "update": {
                                "direct": 0,
                                "total_child": 0,
                            }, 
                           "upsert": true,                 // Available starting in 4.2.1
                        }
                     }
                    //  bulk_obj.push(obj);
                      
                    return obj;
                }

            } catch(error) {
                return error
            }  
        })
        Promise.all(all_data).then((d)=>{
            console.log("d: ", d);
            console.log("all updated = ", d.filter((d1)=>{if(d1.updateOne.update.direct > 0) return d1;}));
            User.bulkWrite(d).then((d2)=>{
                console.log("End: ", new Date().toLocaleString());
                return d2;
            }).catch((error)=>{
                console.log("Error in updatetion: ", error.message);
                return error;
            });
        })
    } catch (error) {
        return error
    }
   
}



// Date Update Function

async function convertingDate(){
    const date = "3/12/2021"
    const regex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
    const User = require('./models/user')
    const user = await User.findOne({member_id: "17d80058f2fC"})
    // let d1 = user[0].activation_date.split("/");
    // let d2 = await new Date(d1.reverse().join('/')).toISOString()
    // console.log(d2)
    // user.map(async(d) => {
    //     // console.log((d.activation_date).match(regex))
    //     const date = (d.activation_date).match(regex);
    //     if(date){
            let d1 = user.activation_date.split("/");
            let d2 = await new Date(d1.reverse().join('/')).toISOString()
            // console.log(date.length)
            console.log("Date: ",user.member_id, user.activation_date, d2)
            await User.updateOne({member_id: user.member_id},  {
                $set :{
                    activation_date: d2                   
                }
            })
        // }
    // })
}

















async function levelWalletConditions(member_id, direct, userLevel, total_child){
    // MFE2019847
    try{
        const {lavelIncome_Model} = require('./functions/function')
    await lavelIncome_Model(member_id)
    if(direct >= 2 && 0 < total_child ){
        const incomeType = "NewDistributorIncome"
        const level = 1
        userLevel = await userlevelgo(member_id, 0, 2, 1)
        await lavelIncome_ModelUpdate(member_id, incomeType, level)
    } 
    if(userLevel >= 1 && total_child > 5 && direct >= 3){
        const incomeType = "BusinessDistributor"
        const level = 2
        userLevel = await userlevelgo(member_id, 1, 3, 2)
        await lavelIncome_ModelUpdate(member_id, incomeType, level)
            
        }
    if(userLevel >= 2 && total_child >= 15 && direct >= 4){
        const level = 3
        const incomeType = "GrowthDistributor"
        userLevel = await userlevelgo(member_id, 2, 4, 3)
        await lavelIncome_ModelUpdate(member_id, incomeType, level)
    } 
    if(userLevel >= 3 && total_child > 49 && direct >= 5){
        const level = 4
        const incomeType = "PlatinumDistributor"
        userLevel = await userlevelgo(member_id, 3, 5, 4)
        await lavelIncome_ModelUpdate(member_id, incomeType, level)
    } 
    if(userLevel >= 4 && total_child > 79 && direct >= 3){
        const level = 5
        const incomeType = "SeniorDistributor"   
        userLevel = await userlevelgo(member_id, 4, 6, 5)
        await lavelIncome_ModelUpdate(member_id, incomeType, level)
    } if(userLevel == 5 ){
        console.log("Level 5")
            lavelIncome_ModelUpdate(member_id, "SeniorDistributor", 5)
    }
    if(userLevel == 5 && total_child >= 150){
        const User = require("./models/user")
        console.log("hhhhhhhhhhhhhhhhhh")
        const {Royeltyincome_Model, lavelIncome_Model} = require('./functions/function')
        const user = await User.find({sponsor_id: member_id},{level:5},{status:1})
        if(user.length >= 3){
            if(5 <= userLevel && userLevel < 7){
                await updateLevel(member_id, 6)
                await Royeltyincome_Model(member_id)
                console.log("................")
            }      
        }   
    } 
    if(userLevel == 6 && total_child >= 210){
        const { ClubIncome_Model } = require('./functions/function')
        const user = await User.find({sponsor_id: member_id},{level:6})
        if(user.length >= 3){
            await ClubIncome_Model(member_id)
            await updateLevel(member_id, 7)    
        }   
    } 
    if(userLevel == 7 && total_child >= 330){
        const user = await User.find({sponsor_id: member_id},{level:7})
        if(user.length >= 3){
            await updateLevel(member_id, 8)  
        }   
    }} catch (error) {
            return error
    }
}

async function userlevelgo(member_id, min, max, userLevel){
    const User = require('./models/user')
    const user = await User.findOne({member_id: member_id})
    // console.log(user.level)
    if(min <= user.level && user.level < max){
        await updateLevel(member_id, userLevel)
    }
}

async function updateLevel(member_id, level){
    const User = require("./models/user")
    const user = await User.findOne({member_id:member_id});
   await  User.updateOne({member_id: member_id}, {
        $set :{
            level: parseInt(level),                    
        }
    });
}

async function lavelIncome_ModelUpdate(member_id, incomeType, level){
    // console.log("🐱‍🏍🐱‍🏍🐱‍🏍🐱‍🏍🐱‍🏍🐱‍🏍", member_id, incomeType, level);
    const Level = require('./models/lavelincome')
    await Level.updateOne({member_id: member_id},  {
        $set :{
            income_type: incomeType,
            lavel_level: level,                    
        }
    })
}

async function level(skip, limit){
    const User = require("./models/user")
    const user = await User.find({member_id: member_id })
    //  const u = await User.findOne({$or:[{status:"1"}, {activeStatus:1}]})

    const userData = await User.find({$or:[{status:"1"}, {activeStatus:1}]}).skip(skip).limit(limit)
    console.log(userData.length)
    // userData.map(async(user) => {
        await levelWalletConditions(user.member_id, user.direct, user.level, user.total_child)
    // })
}







async function levelWalletConditions(member_id, direct, userLevel, total_member){
    const { lavelIncome_Model } = require('./Controllers/levelincomController')
    try{
        console.log(member_id)
        lavelIncome_Model(member_id)

        if(direct >= 2 && userLevel >= 0 ){
            // const w_amt = day7directlength * 200; // per week new Direct
            const incomeType = "NewDistributorIncome"
            const level = 1
            userLevel = await userlevelgo(member_id, 0, 2, 1)
            await lavelIncome_ModelUpdate(member_id, incomeType, level)
            console.log(" const level = 1", userLevel)
            // await updateLevelIncomeWellate(member_id, w_amt, incomeType, level)
        }
        if(userLevel >= 1 && direct >= 2 && total_member >= 5){
            // const w_amt = day7childslength * 100; // per week new Direct
            const incomeType = "BusinessDistributor"
            const level = 2
            userLevel = await userlevelgo(member_id, 1, 3, 2)
            await lavelIncome_ModelUpdate(member_id, incomeType, level)
            console.log(" const level = 2", userLevel)

            // await updateLevelIncomeWellate(member_id, w_amt, incomeType, level)
        }
        if(userLevel >= 2 && direct >= 2 && total_member >= 15){
            // const w_amt = day7childslength * 60; // per week new Direct
            const incomeType = "GrowthDistributor"
            const level = 3
            userLevel = await userlevelgo(member_id, 2, 4, 3)
            await lavelIncome_ModelUpdate(member_id, incomeType, level)
            console.log(" const level = 3", userLevel)

            // await updateLevelIncomeWellate(member_id, w_amt, incomeType, level)
        }
        if(userLevel >= 3 && direct >= 2 && total_member >= 49){
            // const w_amt = day7childslength*40; // per week new Direct
            const incomeType = "PlatinumDistributor"
            const level = 4
            userLevel = await userlevelgo(member_id, 3, 5, 4)
            await lavelIncome_ModelUpdate(member_id, incomeType, level)
            console.log(" const level = 4", userLevel)

            // await updateLevelIncomeWellate(member_id, w_amt, incomeType, level)
        }
        if(userLevel >= 4 && direct >= 2 && total_member >= 79){
            // const w_amt = day7childslength*30; // per week new Direct
            const incomeType = "SeniorDistributor"
            const level = 5
            userLevel = await userlevelgo(member_id, 4, 6, 5)
            await lavelIncome_ModelUpdate(member_id, incomeType, level)
            console.log(" const level = 5", userLevel)

            // await updateLevelIncomeWellate(member_id, w_amt, incomeType, level)
        }
        // if(userLevel == 5 && total_member >= 150){
        //     const User = require("./models/user")
        //     // console.log("hhhhhhhhhhhhhhhhhh")
        //     const {Royeltyincome_Model, lavelIncome_Model} = require('./functions/function')
        //     const user = await User.find({sponsor_id: member_id},{level:5},{status:1})
        //     if(user.length >= 3){
        //         if(5 <= userLevel && userLevel < 7){
        //             // const w_amt = day7childslength * 20;
        //             const incomeType = "Diamond Distributor"
        //             userLevel = await updateLevel(member_id, 6)
        //             await Royeltyincome_Model(member_id)
        //             // await updateLevelIncomeWellate(member_id, w_amt, incomeType, 6)
        //             console.log("................")
        //         }
                      
        //     }   
        // } 
        // if(userLevel == 6 && total_member >= 210){
        //     const User = require('./models/user')
        //     const { ClubIncome_Model } = require('./functions/function')
        //     const user = await User.find({sponsor_id: member_id},{level:6})
        //     if(user.length >= 3){
        //         // const w_amt = day7childslength * 15;
        //         const incomeType = "Royal Life Distributor"
        //         await ClubIncome_Model(member_id)
        //         userLevel = await updateLevel(member_id, 7)  
        //         // await updateLevelIncomeWellate(member_id, w_amt, incomeType, 6)  
        //     }   
        // } 
        // if(userLevel == 7 && total_member >= 330){
        //     const User = require('./models/user')
        //     const user = await User.find({sponsor_id: member_id},{level:7})
        //     if(user.length >= 3){
        //         // const w_amt = day7childslength * 15;
        //         const incomeType = "Standard Royal Distributor"
        //         userLevel = await updateLevel(member_id, 8)  
        //         // await updateLevelIncomeWellate(member_id, w_amt, incomeType, 6)
        //     }
        // }  
         
}  catch(error){
    console.log("error", error)
    return error
}  
}


async function updatesevenToeight(member_id){
    const User = require('./models/user')
    const user = await User.find({sponsor_id : member_id, level: 6})
    if(user.length >= 3){
        console.log(user.length, await User.findOne({member_id: member_id}))
    // console.log(user.length)
        await User.updateOne({member_id: member_id }, {
            $set :{
                level: 7,          
            }
        })
    }


}
updatesevenToeight()



async function userlevelgo(member_id, min, max, userLevel){
    const User = require('./models/user')
    const user = await User.findOne({member_id: member_id})
    if(min <= user.level && user.level < max){
        await updateLevel(member_id, userLevel)
        return userLevel + 1
    }
}



async function lavelIncome_ModelUpdate(member_id, incomeType, level){
    // console.log("🐱‍🏍🐱‍🏍🐱‍🏍🐱‍🏍🐱‍🏍🐱‍🏍", member_id, incomeType, level);
    const Level = require('./models/lavelincome')
    await Level.updateOne({member_id: member_id},  {
        $set :{
            income_type: incomeType,
            lavel_level: level,                    
        }
    })
}

async function level(skip, limit){
    const User = require("./models/user")
    // const user = await User.find({member_id: "17d80058f2fC" })
    //  const u = await User.findOne({$or:[{status:"1"}, {activeStatus:1}]})
    // console.log(user)
    // console.log(user[0].member_id, user[0].direct, user[0].level, user[0].total_child)

    const userData = await User.find({$or:[{status:"1"}, {activeStatus:1}]}).skip(skip).limit(limit)
    // console.log(userData.length)
    let allData = userData.map(async(user) => {
        await updatesevenToeight(user.member_id)
    })
    Promise.all(allData).then((d)=>{
        console.log("all updated = ", userData.length, new Date().toLocaleString());
    }) 
}











async function updateCashback(){
    const Cashback = require('./models/chackback')
    const chackback = await Cashback.find({})
    const a = chackback.map(async(d) => {
        await Cashback.updateOne({member_id: d.member_id }, {
            $set :{
                chackback_amount: 0,
                credited_amount:0,
                time_perioud:  0,
                count:0                   
            }
        }) 
    }) 
    Promise.all(a).then((d) => {
        console.log("All Update")
    })
}


async function updateUseractivationDate(){
    const BuyPackage = require('./models/buy_package')
    const User = require('./models/user')
    const buy = await BuyPackage.find({status:1})
    buy.map(async(d) => {
        console.log("DD>>", d.member_id, d.updatedAt)
    const user = await User.findOne({member_id: d.member_id})
    await User.updateOne({member_id: d.member_id},{
          $set: {
            activation_date: d.updatedAt,
          },
        }
      );
    })
    // console.log(buy)

 }
//  updateUseractivationDate()




// async function updateUseractivationDate(){
//     const BuyPackage = require('./models/buy_package')
//     const User = require('./models/user')
//     const user = await User.find({status:"1"})
//     user.map(async(d) => {
//     console.log("User", d.member_id, d.status)
//     await User.updateOne({member_id: d.member_id},{
//           $set: {
//             activeStatus: 1,
//           },
//         }
//       );
//     })
//     // console.log(buy)

//  }
//  updateUseractivationDate()
