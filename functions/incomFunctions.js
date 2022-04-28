
async function findChild(member_id) {
    const User = require("../models/user");
    try {
      const data = await User.aggregate([
        { $match: { "sponsor_id": member_id } },
        {
            $graphLookup: {
                from: "user",
                startWith: "$sponsor_id",
                connectFromField: "member_id",
                connectToField: "sponsor_id",
                // maxDepth: 5,
                // depthField: "numConnections",
                as: "children"            
            },   
            
        },
        { 
            $project: {
              "member_id": 1,
              "sponsor_id": 1,
              "children.length": 1,
            }
          }
   
    ])
   
    if(data && data.length > 0){
        // console.log("data*******",data[0].children, data.length)
        // const past7daychilds = await data[0].children.filter((d)=>{if (new Date(d.activation_date).getTime() > new Date(weeK_Calculate).getTime()) return d})
        // const past7daydirect = await data.filter((d)=>{if (new Date(d.activation_date).getTime() > new Date(weeK_Calculate).getTime()) return d})
        // const past7daychildsLength = past7daychilds.length
        // const past7daydirectLength = past7daydirect.length
        return data
    }else {
       // console.log("past7daychilds[0]: ", [].length)
        //console.log("Totalchilds[0]",[].length)
        return [];
      }
    } catch (error) { //getDirectAndtotalmember
      console.log("Error from getDirectAndtotalmember: ", error.message)
    }
  }
  
function updateWellate(member_id, amount, level) {
    try{
        User.findOne({ member_id: member_id }).then((error, user) => {
        if (error) return res.send(400).json({ "message": error });
        if (user) {
            User.updateOne({ member_id: member_id }, {
                $set: {
                    wallet_amt: w_amt + amount,
                    level: level
                }
            })
        }
    })
}catch(error){
    console.log("Error from incomFunctions >> updateWellate: ", error.message)
}
}


async function updateUpperlevelDirectAndTotalMember(member_id) {
    const User = require("../models/user");
    try {
        const data = await User.aggregate([
            {
                $graphLookup: {
                    from: "user",
                    startWith: "$member_id",               //sponsor_id
                    connectFromField: "sponsor_id",          //member_id
                    connectToField: "member_id",           //sponsor_id
                    as: "referal"
                }
            },
            {
                $project: {
                    "member_id": 1,
                    "sponsor_id": 1,
                    "referal.member_id": 1
                }
            },
            { $match: { "sponsor_id": member_id } },
        ])

        if (data && data.length > 0) {
            // console.log("D>>: ", data.length, data[1].referal);
            // console.log(data[0])
            return data
        } else {
            // console.log("Hello")
            return [];
        }
    } catch (error) { //getDirectAndtotalmember
        console.log("Error from getDirectAndtotalmember: ", error.message)
    }
}




async function RoyaltyIncome(past7daychildsLength, member_id){
    const Royalty = require('../models/RoyaltyIncome')
    const royalty = Royalty.findOne({member_id: member_id })
    if(past7daychildsLength >=60 && royalty.royalty_level == 0 ){
        const credited_amount = past7daychildsLength * 8 // 
        const royalty_level = 1
        const income_type = "Diamond Distributor Royalty"
        UpdateRoyalty(member_id, credited_amount, royalty_level, income_type)
    } 
    if(past7daychildsLength >= 90  && royalty.royalty_level == 1){
        const credited_amount = past7daychildsLength * 8 // 
        const royalty_level = 2
        const income_type = "Royal Life Distributor Royalty"
        UpdateRoyalty(member_id, credited_amount, royalty_level, income_type)
    }
    if(past7daychildsLength >= 120  && royalty.royalty_level == 2){
        const credited_amount = past7daychildsLength * 8 // 
        const royalty_level = 3
        const income_type = "Standard Royal Distributor Royalty"
        UpdateRoyalty(member_id, credited_amount, royalty_level, income_type)
    }
}


async function UpdateRoyalty(member_id, credited_amount, royalty_level, income_type){
    const Royalty = require('../models/RoyaltyIncome')
    const royalty = await Royalty.findOne({member_id:member_id})
    // console.log("_cashback>>>>>>>>>>>>>>>",Cashback.count, Cashback.time_perioud)
    await Cashback.updateOne({member_id: member_id }, {
        $set :{
            income_type: income_type,
            credited_amount: parseInt(credited_amount),
            royalty_amount:  royalty.royalty_amount + parseInt(credited_amount),
            royalty_level:   parseInt(royalty_level)                   
        }
    })  
}


async function ClubQualifingLevel(member_id){
    const User = require("../models/user");
    const weeK_Calculate = new Date(Date.now()- (1000*3600*24*7))
    const perWeekMember = await User.find({"sponsor_id": member_id,createdAt: {
        $gt:  new Date(weeK_Calculate).toISOString(),
        $lt:  new Date(Date.now()).toISOString()
    }})
    const data = await User.aggregate([
        { $match: { "sponsor_id": member_id } },
        {
            $graphLookup: {
                from: "user",
                startWith: "$sponsor_id",
                connectFromField: "member_id",
                connectToField: "sponsor_id",
                as: "children"            
            },
        },
    
    ])
    
    if(data && data.length > 0){
        const past7daychilds = await data[0].children.filter((d)=>{if (new Date(d.createdAt).getTime() > new Date(weeK_Calculate).getTime()) return d})
        const past7daydirect = await data.filter((d)=>{if (new Date(d.createdAt).getTime() > new Date(weeK_Calculate).getTime()) return d})
        const past7daychildsLength = past7daychilds.length
        const past7daydirectLength = past7daydirect.length

        if(past7daychilds.length > 0)
        ClubIncome(past7daychildsLength, member_id)
    }else {
        console.log("past7daychilds[0]: ", [].length)
        console.log("Totalchilds[0]",[].length)
        return [];
      }
      
}


async function ClubIncome(past7daychildsLength, member_id){
    const Club = require('../models/ClubIncome')
    const club = Club.findOne({member_id: member_id })
    if(past7daychildsLength >=60 && club.club_level == 0 ){
        const credited_amount = past7daychildsLength * 12 // 
        const club_level = 1
        const income_type = "Club Royal Life Distributor"
        UpdateClub(member_id, credited_amount, club_level, income_type)
    } 
    if(past7daychildsLength >= 90  && club.club_level == 1){
        const credited_amount = past7daychildsLength * 12 // 
        const club_level = 2
        const income_type = "Club Standard Royal Distributor"
        UpdateClub(member_id, credited_amount, club_level, income_type)
    }
}

async function UpdateClub(member_id, credited_amount, club_level, income_type){
    const Club = require('../models/ClubIncome')
    const club = await Club.findOne({member_id:member_id})
    // console.log("_cashback>>>>>>>>>>>>>>>",Cashback.count, Cashback.time_perioud)
    await Cashback.updateOne({member_id: member_id }, {
        $set :{
            income_type: income_type,
            credited_amount: parseInt(credited_amount),
            club_amount:  club.club_amount + parseInt(credited_amount),
            club_level:   parseInt(club_level)                   
        }
    })  
}





module.exports = {
    updateWellate,
    findChild
};
