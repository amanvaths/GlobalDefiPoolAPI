const Admin = require("../../models/admin");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function getOwnerWalletAddress(req, res) {
  try {
    const admin = await Admin.findOne({});
    if (admin) {
      return res
        .status(200)
        .json({ onwer_wallet_address: admin.owner_wallet_address });
    } else {
      return res.status(400).json({ message: "Somthing went wrong" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function signup(req, res) {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (admin)
      return res.status(400).json({ message: "user already registered" });

    const { email, password, conform_password } = req.body;
    if (password !== conform_password) {
      return res.status(400).json({
        message: "Enter same password",
      });
    }
    const hash = await bcrypt.hash(password, 10);
    const _admin = new Admin({
      email,
      hash_password: hash,
    });

    _admin.save((error, data) => {
      if (error) {
        console.log("Error from: adminController >> signup", error.message);
        return res.status(400).json({
          message: "Somthing went wrong",
          error: error.message,
        });
      }
      if (data) {
        // sendMobileOtp(contact, message)
        return res.status(200).json({
          message: "user created successfully",
          data: data,
        });
      }
    });
  } catch (error) {
    console.log("Error from userController >> signup: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function signin(req, res) {
  try {
    Admin.findOne({ email: req.body.email }).then(async (admin, error) => {
      if (error) return res.status(400).json({ error });
      if (admin) {
        let isValid = bcrypt.compareSync(
          req.body.password,
          admin.hash_password
        );
        if (isValid) {
          const { _id, email } = admin;
          const token = jwt.sign(
            { _id: admin._id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          return res.status(200).json({
            token,
            admin: {
              _id,
              email,
            },
          });
        } else {
          return res.status(400).json({
            message: "Invalide username and password",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect credentials, user not found.",
        });
      }
    });
  } catch (error) {
    console.log("Error from adminController >> signin: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function userInfo(req, res) {
  const User = require("../../models/user");
  try {
    const { member_id, startDate, endDate } = req.body;
    if (member_id) {
      /*User.findOne({ member_id: member_id }).then(async (data, error) => {
        if (error) return res.status(200).json({ message: error });
        if (data) {
          const directChild = await  User.find({ sponsor_id: member_id }).sort({createdAt: -1})
          return res.status(200).json({ data, directChild });
        }
      });*/

      const data = await User.findOne({ member_id: member_id });
      if (data) {
        const directChild = await User.find({ sponsor_id: member_id }).sort({
          createdAt: -1,
        });
        return res.status(200).json({ data, directChild });
      } else {
        return res
          .status(400)
          .json({ message: "MemberID not found, member does not exists." });
      }
    } else {
      User.find({}).then(async (data, error) => {
        if (error) return res.status(200).json({ message: error });
        if (data) {
          return res.status(200).json({ data });
        }
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Error frome: controller >> signin ",
      error: error.message,
    });
  }
}

async function getIncomeHistory(req, res) {
  const History = require("../../models/History");
  try {
    const { member_id } = req.body;
    if (member_id) {
      History.find(req.body).then(async (data, error) => {
        if (error) return res.status(200).json({ message: error });
        if (data) {
          return res.status(200).json({ data });
        }
      });
    } else {
      History.find({}).then(async (data, error) => {
        if (error) return res.status(200).json({ message: error });
        if (data) {
          return res.status(200).json({ data });
        }
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Error frome: controller >> signin ",
      error: error.message,
    });
  }
}

async function getFundTransferHistory(req, res) {
  const fundHistory = require("../../models/fundTransfer");
  try {
    const { from, to } = req.body;
    if (from || to) {
      fundHistory.find(req.body).then(async (data, error) => {
        if (error) return res.status(400).json({ error: error });
        if (data) {
          return res.status(200).json({ data });
        }
      });
    } else {
      fundHistory.find({}).then(async (data, error) => {
        if (error) return res.status(400).json({ error: error });
        if (data) {
          return res.status(200).json({ data });
        }
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Error frome: controller >> signin ",
      error: error.message,
    });
  }
}

async function getDashboardData(req, res) {
  const UserModal = require("../../models/user");
  const HistoryModal = require("../../models/History");
  const levelWiseMemberCount = await UserModal.aggregate([
    {
      $group: {
        _id: { level: "$level" },
        memberLevel: { $first: "$level" },
        membersCount: { $sum: 1 },
      },
    },
  ]);
  const membersCount = await UserModal.aggregate([
    {
      $group: {
        _id: { level: "$status" },
        memberStatus: { $first: "$status" },
        membersCount: { $sum: 1 },
      },
    },
  ]);
  const totalInvestment = await UserModal.aggregate([
    {
      $group: {
        _id: null,
        totalInvestment: { $sum: "$investment" },
      },
    },
  ]);

  const totalWidthdrawl = await UserModal.aggregate([
    { $match: { income_type: "widthdrawl" } },
    {
      $group: {
        _id: null,
        totalWidthdrawl: { $sum: "$amount" },
      },
    },
  ]);
  return res.status(200).json({
    levelWiseMemberCount,
    membersCount,
    totalInvestment,
    totalWidthdrawl,
  });
}

async function adminTouser(req, res) {
  try {
    const Admin = require("../../models/admin");
    const User = require("../../models/user");
    const {
      fundTransferHistory,
    } = require("../../Controllers/pinissueController");
    const { member_id, amount, wallet_type } = req.body;
    const user = await User.findOne({ member_id: member_id });
    switch (wallet_type) {
      case "bep20_wallet":
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              bep20_wallet: Number(user.bep20_wallet) + Number(amount),
            },
          }
        );
        break;
      case "coin_wallet":
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              coin_wallet: Number(user.coin_wallet) + Number(amount),
            },
          }
        );
        break;
      case "income_wallet":
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              income_wallet: Number(user.income_wallet) + Number(amount),
            },
          }
        );
        break;
    }
    await fundTransferHistory("Admin", member_id, amount);
    return res.status(200).json({ message: "fund transfer successfully" });
  } catch (error) {
    console.log("Error from: adminController >> adminTouser", error);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function debitWallet(req, res) {
  try {
    const Admin = require("../../models/admin");
    const User = require("../../models/user");
    const {
      fundTransferHistory,
    } = require("../../Controllers/pinissueController");
    const { member_id, amount, wallet_type } = req.body;
    const user = await User.findOne({ member_id: member_id });
    switch (wallet_type) {
      case "bep20_wallet":
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              bep20_wallet: Number(user.bep20_wallet) - Number(amount),
            },
          }
        );
        break;
      case "coin_wallet":
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              coin_wallet: Number(user.coin_wallet) - Number(amount),
            },
          }
        );
        break;
      case "income_wallet":
        await User.updateOne(
          { member_id: member_id },
          {
            $set: {
              income_wallet: Number(user.income_wallet) - Number(amount),
            },
          }
        );
        break;
    }
    await fundTransferHistory("Admin", member_id, amount);
    return res.status(200).json({ message: "fund removed successfully" });
  } catch (error) {
    console.log("Error from: adminController >> adminTouser", error);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function updateUserLevelByAdmin(req, res) {
  const user = require("../../models/user");
  try {
    const { member_id, rank } = req.body;
    await user.updateOne(
      { member_id: member_id },
      {
        $set: {
          level: rank,
        },
      }
    );
    return res.status(200).json({ message: "level update successfully" });
  } catch (error) {
    console.log("Error from: adminController >> updateUserLevelByAdmin", error);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function updateOwnerWalletAddress(req, res) {
  try {
    const updateResult = await Admin.updateOne(
      {
        email: req.body.email,
      },
      {
        $set: {
          owner_wallet_address: req.body.owner_wallet_address,
        },
      }
    ).then((fundRequest, error) => {
      if (error) res.status(400).json({ message: "Something went wrong." });
      res.status(200).json({
        message: "Owner wallet address updated successully.",
        fundRequest,
      });
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getWithdrawlRequest(req, res) {
  try {
    const withdrawlRequests = require("../../models/withdrawlRequests");
    /*const allRequests = await withdrawlRequests
      .find(req.body)
      .sort({ createdAt: -1 });*/
    const allRequests = await withdrawlRequests
      .aggregate([
        {
          $match: req.body,
        },
        {
          $lookup: {
            from: "user",
            localField: "member_id",
            foreignField: "member_id",
            as: "userInfo",
          },
        },
      ])
      .sort({ createdAt: -1 });
    if (allRequests) {
      res.status(200).json(allRequests);
    } else {
      res.status(400).json({ message: "Something went wrong." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function approveWithdrawlRequest(req, res) {
  try {
    const withdrawlRequests = require("../../models/withdrawlRequests");
    const updateResult = await withdrawlRequests
      .updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            is_approved: 1,
            txn_hash: req.body.txn_hash,
          },
        }
      )
      .then(async (fundRequest, error) => {
        if (error) res.status(400).json({ message: "Something went wrong." });
        if (req.body.status == 1) {
          //const re = await withdrawlRequests.findOne({_id: req.body.id});
          //const memberID = re.member_id;
          //const wallet_type = re.wallet_type;
          //await User.updateOne({member_id: memberID},{$inc: {[wallet_type]: -re.amount}});
        } /* else if (req.body.status == 2) {
          const re = await withdrawlRequests.findOne({ _id: req.body.id });
          const memberID = re.member_id;
          const wallet_type = re.wallet_type;
          await User.updateOne(
            { member_id: memberID },
            { $inc: { [wallet_type]: re.amount } }
          );
        } */
        res.status(200).json({
          message: "Request approved successully.",
          fundRequest,
        });
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function rejectWithdrawlRequest(req, res) {
  try {
    const withdrawlRequests = require("../../models/withdrawlRequests");
    const updateResult = await withdrawlRequests
      .updateOne(
        {
          _id: req.body.request_id,
        },
        {
          $set: {
            is_approved: 2,
            remark: req.body.remark,
          },
        }
      )
      .then(async (fundRequest, error) => {
        if (error) res.status(400).json({ message: error.message });
        const re = await withdrawlRequests.findOne({
          _id: req.body.request_id,
        });
        const memberID = re.member_id;
        const wallet_type = re.wallet_type;
        await User.updateOne(
          { member_id: memberID },
          { $inc: { [wallet_type]: re.amount } }
        );
        res.status(200).json({
          message: "Request rejected successfully.",
          fundRequest,
        });
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function changeMinMaxTopupAmount(req, res) {
  try {
    const { min_topup_amount, max_topup_amount } = req.body;
    const Admin = require("../../models/admin");
    await Admin.updateOne({
      $set: {
        min_topup_amount: min_topup_amount,
        max_topup_amount: max_topup_amount,
      },
    });
    res
      .status(200)
      .json({ message: "Min-Max topup amount updated successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function generateNewAddress(req, res) {
  try {
    const axios = require("axios");
    const userID = req.body.member_id;
    const ress = await axios.get(
      "https://api.globaldefipool.com/generate-address",
      {
        headers: {
          "Access-Control-Allow-Origin": true,
        },
      }
    );
    const deposit_wallet = ress.data.address;
    if (deposit_wallet) {
      await User.updateOne(
        { member_id: userID },
        { $set: { deposit_wallet: deposit_wallet } }
      );
      const DepositAddressHistory = require("../../models/DepositAddressHistory");
      await DepositAddressHistory.insertMany([
        { member_id: userID, address: deposit_wallet, gtype: "onRegenerate" },
      ]);
      res.status(200).json({
        message: "Wallet address generated successfully.",
        address: deposit_wallet,
      });
    } else {
      res.status(400).json({ message: "Something went wrong." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function changeAdminPassword(req, res) {
  try {
    const { email, pass, confirm_pass, old_pass } = req.body;
    if (confirm_pass === pass) {
      const oldPashHash = await bcrypt.hash(old_pass, 10);
      const admin = await Admin.find({
        email: email,
        hash_password: oldPashHash,
      });
      if (admin) {
        const hash = await bcrypt.hash(pass, 10);
        await Admin.updateOne(
          { email: email },
          {
            $set: {
              hash_password: hash,
            },
          }
        );
        return res
          .status(200)
          .json({ message: "Password Successfully Updated" });
      } else {
        return res
          .status(400)
          .json({ message: "Old password does not matched." });
      }
    } else {
      return res.status(400).json({ message: "Password confirmation failed." });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function getStasticsData(req, res) {
  try {
    const dt = new Date();
    const dtt = new Date(
      `${dt.getMonth() + 1}-${dt.getDate()}-${dt.getFullYear()}`
    );
    const registrations = await User.aggregate([
      { $match: { createdAt: { $gte: dtt } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
    ]);

    const HistoryModal = require("../../models/History") 
    const stakinghistory = await HistoryModal.aggregate([
      { $match: { income_type: "ID Activation" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
    ]);

    const InvestmentModal = require("../../models/investment") 
    const investmenthistory = await InvestmentModal.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          list: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      registrations,
      stakinghistory,
      investmenthistory
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}
100362
async function getDateWiseWithdrawReq(req, res) {
  try {
    const wrModel = require("../../models/withdrawlRequests");
    const pending_wr = await wrModel.aggregate([
      { $match: { is_approved: 0 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalwr_amount: { $sum: "$amount" },
          totalwr: { $sum: 1 },
          wr: { $push: "$$ROOT" },
        },
      },
    ]);
    const approved_wr = await wrModel.aggregate([
      { $match: { is_approved: 1 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalwr_amount: { $sum: "$amount" },
          totalwr: { $sum: 1 },
          wr: { $push: "$$ROOT" },
        },
      },
    ]);
    const rejected_wr = await wrModel.aggregate([
      { $match: { is_approved: 2 } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalwr_amount: { $sum: "$amount" },
          totalwr: { $sum: 1 },
          wr: { $push: "$$ROOT" },
        },
      },
    ]);
    return res.status(200).json({pending: pending_wr, approved: approved_wr, rejected: rejected_wr});
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function getDateWiseWithdraw(req, res) {
  try {
    const wrModel = require("../../models/History");
    const pending_wr = await wrModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalwr_amount: { $sum: "$amount" },
          totalwr: { $sum: 1 },
          wr: { $push: "$$ROOT" },
        },
      },
    ]);
    return res.status(200).json(pending_wr);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function getStackingBonusReport(req, res) {
  try {
    const { member_id } = req.body;
    const CashbackHistoryModel = require("../../models/cashback_history");
    if (member_id) {
      const ch = await CashbackHistoryModel.find({ member_id: member_id });
      return res.status(200).json(ch);
    } else {
      const ch = await CashbackHistoryModel.find({ member_id: member_id });
      return res.status(200).json(ch);
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function rankWiseMembers(req, res) {
  try {
    const UserModel = require("../../models/user");
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: "$level",
          totalMembers: { $sum: 1 },
          members: { $push: "$$ROOT" },
        },
      },
    ]);
    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function deleteDepositAddress(req, res) {
  try {
    const { member_id } = req.body;
    const UserModel = require("../../models/user");
    if (member_id) {
      const users = await UserModel.updateOne(
        { member_id: member_id },
        { $set: { deposit_wallet: null } }
      );
      return res.status(200).json({ message: "Address deleted successfully" });
    } else {
      return res.status(400).json({ message: "Unable to find member." });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function makeAnnouncement(req, res) {
  try {
    const { announcement, announcement_for } = req.body;
    const AnnModel = require("../../models/announcement");
    if (announcement) {
      const users = await AnnModel.insertMany([
        { announcement, announcement_for },
      ]);
      return res
        .status(200)
        .json({ message: "Announcement placed successfully" });
    } else {
      return res.status(400).json({ message: "Unable to place announcement" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function getAllAnnouncement(req, res) {
  try {
    const { announcement, announcement_for } = req.body;
    const AnnModel = require("../../models/announcement");
    
    const announcements = await AnnModel.find({});
      return res
        .status(200)
        .json(announcements );
    
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}


module.exports = {
  signup,
  signin,
  userInfo,
  getIncomeHistory,
  getFundTransferHistory,
  getDashboardData,
  getOwnerWalletAddress,
  adminTouser,
  updateUserLevelByAdmin,
  updateOwnerWalletAddress,
  getWithdrawlRequest,
  approveWithdrawlRequest,
  changeMinMaxTopupAmount,
  generateNewAddress,
  changeAdminPassword,
  rejectWithdrawlRequest,
  getStasticsData,
  getDateWiseWithdrawReq,
  getStackingBonusReport,
  rankWiseMembers,
  deleteDepositAddress,
  debitWallet,
  makeAnnouncement,
  getAllAnnouncement
};
