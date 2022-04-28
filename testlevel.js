const { income_history, Royeltyincome_Model, ClubIncome_Model } = require("./functions/function");
const { findChild } = require("./functions/incomFunctions");
const user = require("./models/user");
const weekly_generated_income = require("./models/weekly_generated_income");

const levelWiseIncomeList = [0, 200, 100, 60, 40, 30, 20, 15, 15];
const incomeTypes = [
    'NewDistributorIncome',
    'NewDistributorIncome',
    'BusinessDistributor',
    'GrowthDistributor',
    'PlatinumDistributor',
    'SeniorDistributor',
    'DiamondDistributer',
    'RoyalLifeDistributor',
    'StandardRoyalDistributor'
]

function getSponsoringIncome(level, ignoreSponsor = false) {
    const startFrom = ignoreSponsor ? 2 : 1;
    return level == 0 ? levelWiseIncomeList[level] : levelWiseIncomeList.slice(startFrom, level + 1).reduce((total, income) => { return total + income });
}



async function testLevels(member_id, save = false) {
    try {
        const currentDate = Date.now();
        const cDate = new Date(currentDate);
        const dayOfWeek = cDate.getDay();
        //console.log(new Date(currentDate).toLocaleDateString());
        //const lastWeekDate = new Date(currentDate - (1000 * 3600 * 24 * 7));
        const lastWeekDate = new Date(currentDate - (1000 * 3600 * 24 * dayOfWeek));
        lastWeekDate.setUTCHours(0, 0, 0, 0);
        cDate.setUTCHours(0, 0, 0, 0);
        const userInfo = await user.findOne({ member_id });
        const currentLevel = userInfo.level;

        /* AllTotal Childrens */
        const allMemberData = await findChild(member_id);
        const allDirectChilds = allMemberData.length;
        const allChilds = allMemberData[0] ? allMemberData[0].children.length : 0;

        /* Update Lavel */
        let newLevel = currentLevel ? currentLevel : 1;
        if (allDirectChilds >= 2 && currentLevel < 5) {
            if ((currentLevel == 4 && allChilds >= 79) || (currentLevel == 3 && allChilds >= 49) || (currentLevel == 2 && allChilds >= 15) || (currentLevel == 1 && allChilds >= 5)) {
                newLevel = currentLevel + 1;
            }
        } else {
            const directSeniors = await user.find({ sponsor_id: member_id, level: 5 }).count();
            const directDiamonds = await user.find({ sponsor_id: member_id, level: 6 }).count();
            const directRoyalLifeDistributers = await user.find({ sponsor_id: member_id, level: 7 }).count();

            if (directSeniors >= 3 || directDiamonds >= 3 || directRoyalLifeDistributers >= 3) {
                newLevel = currentLevel + 1;
            }
        }
        /* will update new level */
        await user.updateOne({ member_id }, {
            $set: {
                level: newLevel
            }
        })
        if (newLevel == 6) {
            await Royeltyincome_Model(member_id);
        } else if (newLevel == 7) {
            await ClubIncome_Model(member_id);
        }

        /* Last Week Diract Members */
        const lastWeekDirectMembers = await user.find({
            "sponsor_id": member_id, activation_date: {
                $gte: new Date(lastWeekDate).toISOString(),
                $lte: new Date(currentDate).toISOString()
            }
        })

        /* Last Week Total Members */
        const totalMembersData = await user.aggregate([
            { $match: { "sponsor_id": member_id } },
            {
                $graphLookup: {
                    from: "user",
                    startWith: "$sponsor_id",
                    connectFromField: "member_id",
                    connectToField: "sponsor_id",
                    // maxDepth: 5,
                    // depthField: "numConnections",
                    as: "children",
                    restrictSearchWithMatch: {
                        activation_date: {
                            $gt: new Date(lastWeekDate).toISOString(),
                            $lt: new Date(currentDate).toISOString()
                        }
                    }
                },
            },
        ]);

        const lastWeekDirectJoining = lastWeekDirectMembers.length;
        const lastWeekTotalJoinings = (totalMembersData[0] ? totalMembersData[0].children.length : 0) - lastWeekDirectJoining;

        //console.log(getIncome(5));
        const sponsoringIncome = lastWeekDirectJoining * getSponsoringIncome(currentLevel);
        const newJoiningIncome = lastWeekTotalJoinings * levelWiseIncomeList[currentLevel];

        // console.log('CurrentLevel : ', currentLevel);
        // console.log("Sponsoring Income : ", sponsoringIncome);
        // console.log("New Registration's Income : ", newJoiningIncome);
        // console.log("Last WeekDirect Registrations : ", lastWeekDirectJoining);
        // console.log("Total Weekly Registrations : ", lastWeekTotalJoinings);
        const generatedIncome = sponsoringIncome + newJoiningIncome;
        const incomeData = {
            week_start_on: lastWeekDate.toISOString(),
            week_ends_on: cDate.toISOString(),
            member_id,
            current_level: currentLevel,
            sponsoring_lncome: sponsoringIncome,
            new_registrations_income: newJoiningIncome,
            last_weekDirect_registrations: lastWeekDirectJoining,
            total_weekly_registrations: lastWeekTotalJoinings,
            total_amount: generatedIncome,
        }
        console.log(incomeData);
        if (save) {
           /*  console.log("WeeklyIncome ", { member_id: member_id, week_start_on: lastWeekDate.toISOString(), incomeData });
            let userWallet = parseFloat(userInfo.new_wallet_amount);
            console.log("Start Wallet", userWallet);
            userWallet += sponsoringIncome;
            console.log("IncomeHistory Direct", { member_id, userWallet, sponsoringIncome, income_type: incomeTypes[1] });
            userWallet += newJoiningIncome;
            console.log("IncomeHistory InDirect", { member_id, userWallet, newJoiningIncome, income_type: incomeTypes[currentLevel] });
            console.log("Latest Wallet", userWallet); */
            await weekly_generated_income.updateOne(
                { member_id: member_id, week_start_on: lastWeekDate.toISOString() },
                incomeData,
                { upsert: true }
            ).then(async (incomeRecord, error) => {
                if (error) console.log(error.message);
                else {
                    let userWallet = parseFloat(userInfo.new_wallet_amount);
                    if (lastWeekDirectJoining > 0) {
                        userWallet += sponsoringIncome;
                        await income_history(member_id, userWallet, sponsoringIncome, incomeTypes[1]);
                    }
                    if (lastWeekTotalJoinings > 0) {
                        userWallet += newJoiningIncome;
                        await income_history(member_id, userWallet, newJoiningIncome, incomeTypes[currentLevel]);
                    }
                    await user.updateOne({ member_id: member_id }, {
                        $set: {
                            new_wallet_amount: userWallet
                        }
                    }).then((res, error)=>{
                        if(error) console.log(error.message)
                        else {
                            console.log(`UserWallet Updated for ${member_id}`);
                        }  
                    });
                }
            })
        } else {
            return incomeData;
        }
    } catch (error) {
        console.log("Error in generating income: ", error.message);
    }
}

async function generateLevelIncome() {
    user.find({ $or: [{ activeStatus: 1 }] }).then((users, error) => {
        if (error) console.log(error.message)
        const res = users.map(async (member) => {
            //console.log(`member: ${member.member_id}`);
            await testLevels(member.member_id, true);
        })
        Promise.all(res).then(() => {
            console.log("Payment Generation Completed.");
        })
    })
}

async function testingFunction() {
    /* data = await Transaction.aggregate([
        { $match: { income_type: "SPONSORING INCOME" } },
        {
          $group: {
            _id: "$investorId",
            randomID: { "$first": "$random_id" },
            totalIncomeGain: { $sum: "$total_income" },
            maxIncome: { $max: "$total_income" },
            minIncome: { $min: "$total_income" },
            avgIncome: { $avg: "$total_income" },
            investmentHistory: { $push: '$$ROOT' },
          },
        },
      ]) */
    const resWeekWise = await weekly_generated_income.aggregate([
        /* { $match: { income_type: "SPONSORING INCOME" } }, */
        {
            $group: {
                _id: "$week_start_on",
                //randomID: { "$first": "$random_id" },
                totalWeeklyIncome: { $sum: "$total_amount" },
                incomeHistory: { $push: '$$ROOT' },
            },
        },
    ])

    const resWeekWiseUserIncome = await weekly_generated_income.aggregate([
        { $match: { total_amount: { $gt: 0 } } },
        {
            $group: {
                _id: "$member_id",
                //randomID: { "$first": "$random_id" },
                totalWeeklyIncome: { $sum: "$total_amount" },
                incomeHistory: { $push: '$$ROOT' },
            },
        },
    ])

    const incomeHishtory = await income_history.aggregate([
        {
            $group: {
                _id: { member_id: "$member_id", income_type: "$income_type" },
                //randomID: { "$first": "$random_id" },
                totalIncome: { $sum: "$total_amount" },
                incomeHistory: { $push: '$$ROOT' },
            },
        },
    ])
    console.log(resWeekWise);
    console.log("Income to be paid ", resWeekWiseUserIncome);
    console.log("IncomeHistory ", incomeHishtory);
}
module.exports = {
    testLevels,
    generateLevelIncome,
    testingFunction
}