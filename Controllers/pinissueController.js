const {
  findparent,
  UpdateAllParent,
  createIncomeHistory,
} = require("../functions/function");
const { findOne } = require("../models/user");
const { updateUserInfo } = require("./userController");



async function createInvestment(req, res) {
  const Investment = require("../models/investment");
  const { member_id, trans_hash, amount } = req.body;

  try {
    const invest = new Investment({
      member_id: member_id,
      trans_hash,
      amount,
    });
    invest.save(async (error, data) => {
      if (error) {
        console.log("Error from: userController >> signup", error.message);
        return res.status(400).json({
          message: "Somthing went wrong",
          error: error.message,
        });
      }
      if (data) {
        const User = require("../models/user");
        const user = await User.findOne({ member_id: member_id });
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              bep20_wallet: Number(user.bep20_wallet) + Number(amount),
            },
          }
        );
        await createIncomeHistory(member_id, amount, "Smart Investment");
        return res.status(200).json({
          message: "investment fund successfully added",
          data: data,
        });
      }
    });
  } catch (error) {
    console.log(
      "Error From: pinissueController >> createInvestment",
      error.message
    );
    return res.status(400).json({
      error: "somthing went wrong",
    });
  }
}

async function getcreateInvestment(req, res) {
  const Investment = require("../models/investment");
  try {
    const investment = await Investment.find(req.body).sort({createdAt: -1});
    return res.status(200).json({
      data: investment,
    });
  } catch (error) {
    console.log(
      "Error From: pinissueController >> getcreateInvestment",
      error.message
    );
    return res.status(400).json({
      error: "somthing went wrong",
    });
  }
}

async function creacteTopup(req, res) {
  const User = require("../models/user");
  const Admin = require("../models/admin");
  try {
    const { member_id, amount, coin_ratio } = req.body;
    const {min_topup_amount, max_topup_amount} = await Admin.findOne();
    console.log(min_topup_amount, max_topup_amount);
    if(amount >= min_topup_amount && amount <= max_topup_amount) {
        const user = await User.findOne({ member_id: member_id });
        if (user) {
          if (amount % 100 != 0) {
            return res
              .status(400)
              .json({ message: "Please Enter a valid amount " });
          }
    
          if (coin_ratio == 100) {
            if (user.bep20_wallet >= amount) {
              await User.updateOne(
                { member_id: user.member_id },
                {
                  $set: {
                    investment: parseInt(user.investment) + parseInt(amount),
                    bep20_wallet: parseInt(user.bep20_wallet) - parseInt(amount),
                    activation_date: new Date().toISOString(),
                    status: 1,
                  },
                }
              );
            } else {
              return res
                .status(400)
                .json({ message: "Insufficient Account Balance" });
            }
          } else if (coin_ratio == 10) {
            const coin_wallet_amount =  (coin_ratio / 100) * amount
            const bep20_amount = (90 / 100) * amount;
            if (user.bep20_wallet >= bep20_amount/*amount / percent_amount*/ && user.coin_wallet >= coin_wallet_amount/*amount / bep20_amount*/) {
              await User.updateOne(
                { member_id: user.member_id },
                {
                  $set: {
                    investment: parseInt(user.investment) + parseInt(amount),
                    bep20_wallet:
                      parseInt(user.bep20_wallet) - bep20_amount, // parseInt(amount / 2),
                    coin_wallet: parseInt(user.coin_wallet) - coin_wallet_amount, // parseInt(amount / 2),
                    activation_date: new Date().toISOString(),
                    status: 1,
                  },
                }
              );
            } else {
              return res.status(400).json({
                message:
                  "Your coin wallet or BEP20 wallet have Insufficient balance",
              });
            }
          }
          
          if(user.level == -1) {
              await User.updateOne(
                { member_id: user.member_id },
                {
                  $set: {
                    level: 0
                  },
                }
              );
          }
          const incomeType = "ID Activation";
    
          await rCm(user.member_id, amount)
            .then(() => {
              UpdateAllParent(member_id, 1, amount);
            })
            .then(() => {
              createCashbackSchema(member_id, amount);
            })
            .then(() => {
              createIncomeHistory(member_id, amount, incomeType);
            })
            .then(() => {
              return res.status(200).json({ message: "Topup successfully" });
            });
        } else {
          return res.status(400).json({ message: "User not found." });
        }
    } else {
        return res.status(400).json({ message: `You can topup minimum ${min_topup_amount} and maximum ${max_topup_amount} coins.` });
    }
    
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}


async function rCm(memberID, amount) {
  try {
    const percentage = [5, 10, 15, 20, 25, 30];
    const UserModal = require("../models/user");
    const allParents = await incomDistribute(memberID);
    const incomeType = "Rank Bonus";
    //console.log("parent: ", getAllParent);
    // console.log("getAllParent", getAllParent);
   /*  let dt = getAllParent;
    dt.sort((a, b) => (a.ParentNo > b.ParentNo ? 1 : -1));
    let distinctData = [];
    let lastPaidLevel = null;
    for (parent of dt) {
      if (parent.level > lastPaidLevel || lastPaidLevel == null) {
        lastPaidLevel = parent.level;
        distinctData.push(parent);
      }
    }
    console.log("All DistinctParents", distinctData); */
    /*  distinctData = [
      { member_id: "XCEL1000006", level: 0, ParentNo: 1 },
      { member_id: "XCEL1000005", level: 2, ParentNo: 2 },
      { member_id: "XCEL1000004", level: 4, ParentNo: 3 },
      { member_id: "XCEL1000002", level: 5, ParentNo: 5 },
    ]; */
    //console.log("All DistinctParents", distinctData);
    console.log(allParents);
    allParents.forEach((parent, index) => {
      //console.log(`index: ${index}, parent : `, parent);
      let rcPer;
      let rcAmount;
      let diffPer;
      let diffAmount;
      let incomeWallet;
      let coinWallet;
      let sponsorProfit;

      if (parent.ParentNo == 1) {
        rcPer = percentage[parent.level];
        rcAmount = (amount * rcPer) / 100;
        sponsorProfit = rcAmount;
        incomeWallet = Number(rcAmount / 2);
        coinWallet = Number(rcAmount / 2);
        /* console.log(
          parent,
          "Direct Parent ::",
          "rcPer :: ",
          rcPer,
          "rcAmount :: ",
          rcAmount,
          "amount :: ",
          amount,
          "incomeWallet :: ",
          incomeWallet,
          "coinWallet :: ",
          coinWallet
        ); */
      } else {
        rcPer = percentage[parent.level];
        if(allParents[index - 1]) {
          diffPer =
          percentage[parent.level] - percentage[allParents[index - 1].level];
        } else {
          diffPer =
          percentage[parent.level];
        }
        
        rcAmount = (amount * rcPer) / 100;
        diffAmount = (amount * diffPer) / 100;
        sponsorProfit = diffAmount;
        incomeWallet = Number(diffAmount / 2);
        coinWallet = Number(diffAmount / 2);
        /* console.log(
          parent,
          "InDirect Parent :: ",
          "diffPer :: ",
          diffPer,
          "rcPer :: ",
          rcPer,
          "diffAmount :: ",
          diffAmount,
          "rcAmount :: ",
          rcAmount,
          "amount :: ",
          amount,
          "incomeWallet :: ",
          incomeWallet,
          "coinWallet :: ",
          coinWallet
        ); */
      }

      UserModal.findOne({ member_id: parent.member_id }).then((parentInfo) => {
        //console.log(parentInfo);
        const newIncomeWallet = Number(parentInfo.income_wallet) + incomeWallet;
        const newCoinWallet = Number(parentInfo.coin_wallet) + coinWallet;
        const updateInfo = {
          income_wallet: newIncomeWallet,
          coin_wallet: newCoinWallet,
        };
        /* console.log(
          "oldCoinWallet",
          parentInfo.coin_wallet,
          "oldIncomeWallet",
          parentInfo.income_wallet,
          updateInfo
        ); */
        UserModal.updateOne(
          { member_id: parent.member_id },
          {
            $set: updateInfo,
          }
        ).then(async () => {
          const incomeType = "Rank Bonus";
          await createIncomeHistory(
            parent.member_id,
            sponsorProfit,
            incomeType,
            memberID
          );
        });
      });
    });
  } catch (err) {
    console.log("rCm function :: ",err.message);
  }
}


async function referalCommition(member_id, pin_amount) {
  try {
    const User = require("../models/user");
    const getAllParent = await incomDistribute(member_id);
    const incomeType = "Rank Bonus";
    console.log("parent: ", getAllParent)
    // console.log("getAllParent", getAllParent);

    getAllParent.map(async (data, index) => {
      const percentage = [5, 10, 15, 20, 25, 30];
      const user = await User.findOne({ member_id: data.member_id });
      console.log(data.member_id);
      console.log(index)
      if (index == 0) {
        const sponser_per = percentage[data.level];
        const sponser_profite = (pin_amount * sponser_per) / 100;
        console.log("parent: ",sponser_per, sponser_profite, user.member_id)
        await User.updateOne(
          { member_id: user.member_id },
          {
            $set: {
              income_wallet:
                Number(user.income_wallet) + Number(sponser_profite / 2),
              coin_wallet:
                Number(user.coin_wallet) + Number(sponser_profite / 2),
            },
          }
        );
        await createIncomeHistory(user.member_id, sponser_profite, incomeType);
      } else {
        const sponser_per =
          percentage[
            percentage[data.level] - percentage[getAllParent[index - 1].level]
          ];
          console.log("Data: ", data.level, percentage[getAllParent[index - 1].level])
        const sponser_profite = (pin_amount * sponser_per) / 100;
        console.log("unparent: ",sponser_per, sponser_profite, user.member_id)

        await User.updateOne(
          { member_id: user.member_id },
          {
            $set: {
              income_wallet:
                Number(user.income_wallet) + Number(sponser_profite / 2),
              coin_wallet:
                Number(user.coin_wallet) + Number(sponser_profite / 2),
            },
          }
        );
        await createIncomeHistory(user.member_id, sponser_profite, incomeType);
      }
    });
  } catch (error) {
    console.log("Error From referalCommition", error.message);
  }
}

async function createCashbackSchema(member_id, amount) {
  try {
    const Cashback = require("../models/cashback");
    const monthly_cashback = amount * 0.025;

    const cash = new Cashback({
      member_id: member_id,
      plan_amount: amount,
      total_cashback: monthly_cashback * 18,
      monthly_cashback: monthly_cashback,
      duration: 18,
    });

    cash.save((error, data) => {
      if (error) {
        console.log(
          "error from: pinissueController >> createCashbackSchema",
          error.message
        );
      }
      if (data) {
        console.log("Cashback Schema create successfully");
      }
    });
  } catch (error) {
    console.log("Error from: createCashbackSchema", error.message);
  }
}

async function getCashback(req, res) {
  try {
    const Cashback = require("../models/cashback");
    const cash = await Cashback.find(req.body);
    return res.status(200).json({ Data: cash });
  } catch (error) {
    console.log("Error from: getCashback", error.message);
  }
}

async function incomDistribute(member_id) {
  const User = require("../models/user");
  try {
    const data = await User.aggregate([
      { $match: { member_id: member_id } },
      {
        $graphLookup: {
          from: "user",
          startWith: "$member_id",
          connectFromField: "sponsor_id",
          connectToField: "member_id",
          depthField: "ParentNo",
          as: "referal",
        },
      },
      {
        $project: {
          member_id: 1,
          sponsor_id: 1,
          "referal.level": 1,
          "referal.member_id": 1,
          "referal.investment": 1,
          "referal.ParentNo": 1,
        },
      },
    ]);

    if (data && data.length > 0) {
      // return data;
      // console.log("referal",data )
      let referalData = data[0].referal;
      //console.log("referalData: ", referalData)
      const rD = [];
      //console.log("totalLength : ",referalData.length)
      for(let i=0; i<referalData.length ; i++) {
        rD.push(referalData.filter((item)=>{return item.ParentNo == i})[0]);
      }
      console.log("Sort: ", rD);
      let distinctData = [];
      let lastPaidLevel = -1;
      for (num of rD.slice(1)) {
        if (num.level > lastPaidLevel) {
          lastPaidLevel = num.level;
          distinctData.push(num);
        }
      }
      
      //return referalData.filter((item) => item.ParentNo > 0 && item.level > -1 && item.investment > 0);//
      const parentsToBePaid = distinctData.filter((item) => item.ParentNo > 0 && item.level > -1);
      console.log("distinctData: ", distinctData, parentsToBePaid);
      return parentsToBePaid;
    } else {
      // console.log("Hello")
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

async function fundTransferUserToUser(req, res) {
  try {
    const User = require("../models/user");
    const { amount, user_id, downline_id } = req.body;
    const downline = await User.findOne({ member_id: downline_id });
    if (downline) {
      const user = await User.findOne({ member_id: user_id });
      const findDdownline = await findparent(downline_id);
      const isDownline = findDdownline[0].referal.filter(
        (d) => d.level > 0 && d.member_id == user.member_id
      );
      // console.log(isDownline);
      if (isDownline.length > 0) {
        if(user.coin_wallet < amount){
          return res.status(400).json({
            message: `Insufficient balance.`,
          });
        }
        await User.updateOne(
          { member_id: downline_id },
          {
            $set: {
              coin_wallet: Number(downline.coin_wallet) + Number(amount),
            },
          }
        );
        await User.updateOne(
          { member_id: user_id },
          {
            $set: {
              coin_wallet: Number(user.coin_wallet) - Number(amount),
            },
          }
        );
        await fundTransferHistory(user_id, downline_id, amount);
        return res.status(200).json({ message: "Fund transfer successfully" , isDownline});
      } else {
        return res.status(400).json({
          message: `Fund transfer failed, downline[${downline_id}] does not exists.`,
        });
      }
    
    } else {
      return res.status(400).json({
        message: `Fund transfer failed, downline[${downline_id}] does not exists.`,
      });
    }
  } catch (error) {
    console.log(
      "Error From: pinissueController  >> fundTransferUserToUser",
      error.message
    );
    return res.status(400).json({ message: "Somthing went Wrong" });
  }
}

async function fundTransferHistory(from, to, amount) {
  try {
    const FundT = require("../models/fundTransfer");

    const fund = new FundT({
      from: from,
      to: to,
      amount: amount,
    });

    fund.save((error, data) => {
      if (error) {
        console.log(
          "error from: pinissueController >> fundTransferHistory",
          error.message
        );
      }
      if (data) {
        console.log("Fund History");
      }
    });
  } catch (error) {
    console.log("Error from: fundTransferHistory", error.message);
  }
}

async function getTopUpInvestment(req, res) {
  const History = require("../models/History");
  const { member_id } = req.body;
  if (member_id) {
    data = await History.aggregate([
      { $match: { member_id: member_id, income_type: "ID Activation" } },
      {
        $group: {
          _id: "$member_id",
          totalInvestment: { $sum: "$amount" },
          Investment: { $push: "$$ROOT" },
        },
      },
    ]);
  } else {
    data = await History.aggregate([
      { $match: { income_type: "ID Activation" } },
      /* {
        $group: {
          _id: "$member_id",
          totalInvestment: { $sum: "$amount" },
          Investment: { $push: "$$ROOT" },
        },
      }, */
    ]);
  }

  return res.status(200).json({ data });
}

async function fundInvestmentToCoin(req, res) {
  try {
    const User = require("../models/user");
    const { member_id, amount } = req.body;
    const user = await User.findOne({ member_id: member_id });
    if(user.investment >= amount) {
      await User.updateOne(
        { member_id: member_id },
        {
          $set: {
            coin_wallet: Number(user.coin_wallet) + Number(amount),
            investment: Number(user.investment) - Number(amount),
          },
        }
      );
      const incomeType = "Transfer Coin";
      await createIncomeHistory(member_id, amount, incomeType);
      return res.status(200).json({ message: `You have successfully transfered ${amount} coins to your wallet.` });
    } else {
      return res.status(400).json({ message: "You do not have any investment." });
    } 
  } catch (error) {
    console.log(
      "Error From: pinissueController  >> fundInvestmentToCoin",
      error.message
    );
    return res.status(400).json({ message: "Somthing went Wrong" });
  }
}

async function valaidateTransaction() {
  
} 

async function getRoyaltyIncomes(req, res) {
  try {
    const {member_id} = req.body;
    const RoyaltyModel = require("../../models/royalty");
    const royaltyHistory = await RoyaltyModel.find({member_id});
    return res.status(200).json(royaltyHistory);
  } catch(error) {
    return res.status(400).json({message: error.message});
  }
}

module.exports = {
  createInvestment,
  getcreateInvestment,
  creacteTopup,
  getCashback,
  referalCommition,
  getTopUpInvestment,
  fundTransferUserToUser,
  fundInvestmentToCoin,
  incomDistribute,
  rCm,
  fundTransferHistory,
  getRoyaltyIncomes
};

