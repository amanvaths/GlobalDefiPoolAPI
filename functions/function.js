const user = require("../models/user");
const User = require("../models/user");

async function getNextId() {
  const user = await User.findOne({}).sort({createdAt: -1});
  console.log(user)
  const old = user.member_id
  const n = parseInt(old.slice(3)) + Number((Math.floor(Math.random() * 100)).toString())
  const next_id = "GDP" + n
  console.log(next_id)
  return next_id;
}

// async function unique_id() {
//   const id =
//     Date.now().toString(30) +
//     ((Math.random() * 26 + 10) | 0).toString(36).toUpperCase();
//   return id;
// }
async function generatePassword() {
  const random_pass = (Math.floor(Math.random() * 1000000) + 1000000).toString()
  return random_pass
}

async function getSponser(sponser){
  // console.log(sponser)
  const userName = await User.findOne({member_id: sponser, activeStatus: {$ne : 2} })
  if(userName){
      return userName
  } else {
      return false
  }
  // console.log("sponser",userName)
  
}
function getRChar() {
  return ((Math.random() * 26 + 10) | 0).toString(36).toUpperCase();
}

async function generatePin() {
  const s = getRChar() + getRChar() + Math.floor(Math.random() * 9999 * 7);
  return s;
}


async function sendMobileOtp(mobile_no, message) {
  const fetch = require("cross-fetch");
  console.log("message send")
  return await fetch(
    `http://37.59.76.46/api/mt/SendSMS?user=NAYGON&password=q12345&senderid=NADCAB&channel=2&DCS=0&flashsms=0&number=${mobile_no}&text=${message}&route=06`
  );
}

async function findparent(member_id) {
  const User = require("../models/user");
  try {
    const data = await User.aggregate([
      { $match: { member_id: member_id} },
      {
        $graphLookup: {
          from: "user",
          startWith: "$member_id",
          connectFromField: "sponsor_id",
          connectToField: "member_id",
          depthField: "level",
          as: "referal",
        },
      },
      {
        $project: {
          member_id: 1,
          sponsor_id: 1,
          // level: 1,
          "referal.member_id": 1,
          "referal.level": 1,
        },
      },
    ]);

    if (data && data.length > 0) {
      // console.log(data)
      return data;
    } else {
      return [];
    }
  } catch (error) {
    //getDirectAndtotalmember
    console.log(
      "Error from functions >> function >> findparent: ",
      error.message
    );
  }
}

async function UpdateAllParent(member_id, status, amount) {
  try {
    const User = require("../models/user");
    const Allparent = await findparent(member_id);
    const referals = Allparent[0].referal.filter((item) => item.level != 0);
    // console.log(referals);
    switch (status) {
      case 1:
        referals.map(async (d) => {
          const user = await User.findOne({ member_id: d.member_id });
        
            // Update_user_level(
            //   d.member_id,
            // );
          // update user level
          if (d.level == 1) {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  direct_coin: parseInt(user.direct_coin) + parseInt(amount),
                  total_coin: parseInt(user.total_coin) + parseInt(amount),
                },
              }
            ).then(() => {
              Update_user_level(
                d.member_id,
              );
            })
          } else {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  total_coin: parseInt(user.total_coin) + parseInt(amount),
                },
              }
            ).then(() => {
              Update_user_level(
                d.member_id,
              );
            })
          }
        });
        break;
      case -1:
        referals.map(async (d) => {
          const user = await User.findOne({ member_id: d.member_id });
          if (d.level == 0) {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  direct_coin: parseInt(user.direct_coin) - parseInt(amount),
                  total_coin: parseInt(user.total_coin) - parseInt(amount),
                },
              }
            );
          } else {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  total_coin: parseInt(user.total_coin) - parseInt(amount),
                },
              }
            );
          }
        });
        break;
    }
  } catch (error) {
    return console.log(
      "Error from: functions >> function >> UpdateAllParent ",
      error.message
    );
  }
}

async function Update_user_level(member_id) {
  try {
    const user = require("../models/user");
    const userInfo = await user.findOne({ member_id: member_id });
    const currentLevel = userInfo.level;
    /* Update Lavel */
    let newLevel = currentLevel ? currentLevel : 0;
    if (userInfo.direct_coin >= 10000 && currentLevel < 5) {
      if (( userInfo.direct_coin >= 500000 && userInfo.total_coin >= 10000000)) {
        await createRoyltySchema(member_id, 5)
        newLevel = 5;
      }
      else if (( userInfo.direct_coin >= 100000 && userInfo.total_coin >= 2500000)) {
        await createRoyltySchema(member_id, 4)
        newLevel = 4;
      }
      else if (( userInfo.direct_coin >= 50000 && userInfo.total_coin >= 500000)) {
        newLevel = 3;
      }
      else if (( userInfo.direct_coin >= 25000 && userInfo.total_coin >= 100000)) {
        newLevel = 2;
      }
      else if (( userInfo.direct_coin >= 10000 && userInfo.total_coin >= 50000)) {
        newLevel = 1;
      }
    }
    /* will update new level */
    await user.updateOne(
      { member_id: member_id },
      {
        $set: {
          level: newLevel,
        },
      }
    );
    
  } catch (error) {
    console.log("Error from: functions >> function >> Update_user_level", error);
  }
}

async function diret_and_direct_childlength(req, res) {
  try {
    const User = require("../models/user");
    // const { findChild } = require("./incomFunctions");
    const { member_id } = req.body;
    const user = await User.find({ sponsor_id: member_id });
    const total_child = await findparent(member_id);
    
    // console.log(total_child.length)
    return res
      .status(200)
      .json({
        total_Direct: total_child.length,
        total_member: total_child,
        tt: total_child[0].referal.filter((item) => item.level != 0)
      });
  } catch (error) {
    return res
      .status(400)
      .json({
        "error from functions >> function >> total_member_of_direct":
          error.message,
      });
  }
}


async function createIncomeHistory(member_id, amount, incomeType, incomeFrom="") {
    try{
      const History = require("../models/History")
      const User = require("../models/user")
      const user = await User.findOne({ member_id: member_id})
      const history = new History({
        member_id: member_id,
        income_from: incomeFrom,
        amount: amount,
        income_type: incomeType,
        investment: user.investment,
        coin_wallet: user.coin_wallet,
        income_wallet: user.income_wallet,
        level: user.level
      })
      history.save((error, data) => {
        if (error) {
          console.log("Error from: function.js >> createIncomeHistory", error);
        }
        if (data) {
          console.log("success");
        }
      });

    } catch(error) {
      console.log("Error from: function.js >> createIncomeHistory", error.message)
    }
}

async function createRoyltySchema(member_id, level){
  try{
    const Royalty = require("../models/royalty")
    const User = require("../models/user")
    const incomeType = "royalty"
    const user = await User.findOne({ member_id: member_id})
    if(!user) {
      await Royalty.updateOne({member_id: member_id},{
        $set: {
          level: 5
        }
      })
    } else {
      const royalty = new Royalty({
        member_id: member_id,
        level: level,
        income_type: incomeType,
      })
      royalty.save((error, data) => {
        if (error) {
          console.log("Error from: function.js >> createIncomeHistory", error);
        }
        if (data) {
          console.log("data: ", data)
          console.log("royalty Schema create successfully ");
        }
      });
    }

  } catch(error) {
    console.log("Error from: function.js >> createIncomeHistory", error.message)
  }
}

// async function updateRoyltyLevel(member_id) {
//   const Royalty = require("../models/royalty")
//   await Royalty.updateOne({member_id: member_id},{
//     $set: {
//       level: 5
//     }
//   })
// }


async function updateParentTeam(member_id, status) {
  try {
    const User = require("../models/user");
    const Allparent = await findparent(member_id);
    const referals = Allparent[0].referal.filter((item) => item.level != 0);
    // console.log(referals);
    switch (status) {
      case 1:
        referals.map(async (d) => {
          const user = await User.findOne({ member_id: d.member_id });
          if (d.level == 1) {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  direct_members: parseInt(user.direct_members) + 1,
                  total_members: parseInt(user.total_members) + 1,

                },
              }
            )
          } else {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  total_members: parseInt(user.total_members) + 1,
                },
              }
            )
          }
        });
        break;
      case -1:
        referals.map(async (d) => {
          const user = await User.findOne({ member_id: d.member_id });
          if (d.level == 0) {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  direct_members: parseInt(user.direct_members) - 1,
                  total_members: parseInt(user.total_members) - 1,
                },
              }
            );
          } else {
            await User.updateOne(
              { member_id: d.member_id },
              {
                $set: {
                  total_members: parseInt(user.total_members) - 1,
                },
              }
            );
          }
        });
        break;
    }
  } catch (error) {
    return console.log(
      "Error from: functions >> function >> updateParentTeam ",
      error.message
    );
  }
}

module.exports = {
  getNextId,
  getSponser,
  findparent,
  generatePin,
  sendMobileOtp,
  UpdateAllParent,
  createIncomeHistory,
  generatePassword,
  updateParentTeam,
  diret_and_direct_childlength,
};
