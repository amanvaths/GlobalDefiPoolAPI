const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  getSponser,
  getNextId,
  sendMobileOtp,
  generatePassword,
  createIncomeHistory,
  updateParentTeam,
} = require("../functions/function");
const bcrypt = require("bcrypt");
const {
  sendEmailOtp,
  userRagistractionMail,
} = require("../functions/emailsetup");

async function signup(req, res) {
  console.log(req.body);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).json({ message: "user already registered" });

    const { email, sponsor_id, full_name, xcelpay_wallet, country, mobile } =
      req.body;
    const password = await generatePassword();
    const transcation_password = await generatePassword();
    const hash = await bcrypt.hash(password, 10);
    const get_Sponser = await getSponser(sponsor_id);
    if (get_Sponser == false) {
      return res.status(400).json({
        message:
          "Invalid sponser Id or Sponser is blocked. Please enter a valid sponser Id",
      });
    }
    const new_id = await getNextId();
    const axios = require("axios");
    const ress = await axios.get(
      "https://api.globaldefipool.com/generate-address",
      {
        headers: {
          "Access-Control-Allow-Origin": true,
        },
      }
    );
    const deposit_wallet = ress.data.address;

    const _user = new User({
      member_id: new_id,
      sponsor_id: sponsor_id,
      email,
      password: password,
      hash_password: hash,
      txn_password: transcation_password,
      full_name,
      xcelpay_wallet,
      country,
      mobile,
      deposit_wallet,
    });

    _user.save(async (error, data) => {
      if (error) {
        console.log("Error from: userController >> signup", error.message);
        return res.status(400).json({
          message: "Somthing went wrong",
          error: error.message,
        });
      }
      if (data) {
        // sendMobileOtp(contact, message)
        const DepositAddressHistory = require("../models/DepositAddressHistory");
        await DepositAddressHistory.insertMany([
          { member_id: new_id, address: deposit_wallet, gtype: "onSignUp" },
        ]);
        await userRagistractionMail(
          email,
          new_id,
          password,
          transcation_password
        );
        await updateParentTeam(new_id, 1);
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
    const email = req.body.email;
    const u = await User.findOne({ email: email });
    User.findOne({ email: email, status: {$ne: 2}  }).then(async (user, error) => {
      if (error) return res.status(400).json({ error });
      if (user) {
        console.log("User: ", user);
        let isValid = bcrypt.compareSync(req.body.password, user.hash_password);
        console.log("isValid: ", isValid);

        if (isValid) {
          const { _id, email, member_id, sponsor_id, deposit_wallet } = user;
          const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          return res.status(200).json({
            token,
            user: {
              _id,
              email,
              member_id,
              sponsor_id,
              deposit_wallet,
            },
          });
        } else {
          return res.status(400).json({
            message: "Invalide username and password",
          });
        }
      } else {
        return res.status(400).json({
          message: "Incorrect credentials or member is blocked.",
        });
      }
    });
  } catch (error) {
    console.log("Error from userController >> signin: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function updateUserInfo(req, res) {
  try {
    const { member_id, full_name, email, mobile, xcelpay_wallet } = req.body;

    if (member_id) {
      const status = await updateUserProfile({member_id:member_id,full_name: full_name, email:email, mobile:mobile, xcelpay_wallet: xcelpay_wallet });
      if (status) {
        return res.json({
          status: 200,
          error: false,
          params: {
            member_id: member_id,
          },
          message: "User profile Updated successfully",
        });
      } else {
        return res.json({
          status: 400,
          error: true,
          message: "Something went wrong, please try again",
        });
      }
    } else {
      return res.json({
        status: 400,
        error: true,
        message: "Invalid request",
      });
    }
  } catch (error) {
    console.log(
      "Error: from: src>controller>updateUserInfo.js: ",
      error.message
    );
    return res.json({
      status: 400,
      error: true,
      message: "Something went wrong, please try again!",
    });
  }
}

async function updateUserProfile(memberInfo) {
  const User = require("../models/user");
  try {
    console.log(memberInfo);
    if (memberInfo.member_id) {
      const user_bank = await User.updateOne(
        {
          member_id: memberInfo.member_id,
        },
        {
          $set: {
            full_name: memberInfo.full_name,
            email: memberInfo.email,
            mobile: memberInfo.mobile,
            xcelpay_wallet: memberInfo.xcelpay_wallet,
          },
        }
      );
      return {
        status: 200,
        user_data: user_bank,
        error: false,
      };
    }
  } catch (error) {
    console.log(
      "Error: from: constroller>userController>updateUserProfile: ",
      error
    );
    return undefined;
  }
}

async function forgetPassword(req, res) {
  try {
    const forget = require("../models/forgetOtp");
    const User = require("../models/user");
    const { email } = req.body;
    const otp = await generateOtp();
    const user = await User.findOne({ email: email });
    forget.findOne({ email: email }).then(async (data, error) => {
      if (error)
        return res
          .status(400)
          .json({ message: "Somthing went wrong", error: error });
      if (data) {
        await forget.updateOne(
          { email: email },
          {
            $set: {
              otp: otp,
              isExpired: false,
            },
          }
        );
        await sendEmailOtp(user.email, otp);
        return res.status(200).json({ message: "Otp send on your email" });
      } else {
        const fopt = await new forget({
          email: user.email,
          otp: otp,
        });
        await sendEmailOtp(email, otp);
        fopt.save((data, error) => {
          if (error) return res.status(400).json({ message: "error" });
          if (data) {
            return res.status(200).json({ message: "OTP Send" });
          }
        });
      }
    });
  } catch (error) {
    console.log("Error from userController >> forgetPassword: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function sendEmailOTP(req, res) {
  try {
    const ForgetModel = require("../models/forgetOtp");
    const { email } = req.body;
    const otp = await generateOtp();
    await ForgetModel.updateOne(
      { email: email },
      {
        $set: {
          otp: otp,
          isExpired: false,
        },
      },
      { upsert: true }
    );
    await sendEmailOtp(email, otp);
    return res.status(200).json({ message: "Otp send on your email" });
  } catch (error) {
    console.log("Error from userController >> forgetPassword: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

function sendOtp(email, otp) {
  try {
    // const message = `Dear User, Your OTP for UserId ${contact} is ${otp} - TEARN`;
    // return sendMobileOtp(contact, message);
    return sendEmailOtp(email, otp);
  } catch (error) {
    console.log("Error from userController >> sendOtp: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function otp_match(req, res) {
  try {
    const Forget = require("../models/forgetOtp");
    const { member_id, userInput } = req.body;
    console.log(req.body);

    const fkucs = await Forget.findOne({ member_id: member_id });
    if (parseInt(fkucs.otp) == parseInt(userInput)) {
      res.status(200).json({ message: "OTP Matched!" });
    } else {
      res.status(400).json({ message: "Please enter a valid otp!" });
    }
  } catch (error) {
    console.log("Error from userController >> otp_match: ", error.message);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function change_password(req, res) {
  try {
    const User = require("../models/user");
    const { member_id, pass, confirm_pass, password_type, old_pass } = req.body;
    const hash = await bcrypt.hash(pass, 10);
    const userdata = await User.findOne({ member_id: member_id });
    if (userdata) {
      if (pass == confirm_pass) {
        if (
          password_type == "txn_password" &&
          old_pass != userdata.txn_password
        ) {
          return res
            .status(400)
            .json({ message: "Old transaction password does not match." });
        } else if (
          password_type == "password" &&
          old_pass != userdata.password
        ) {
          return res
            .status(400)
            .json({ message: "Old password does not match." });
        } else {
          switch (password_type) {
            case "password":
              await User.updateOne(
                { member_id: member_id },
                {
                  $set: {
                    password: pass,
                    hash_password: hash,
                  },
                }
              );
              break;
            case "txn_password":
              await User.updateOne(
                { member_id: member_id },
                {
                  $set: {
                    txn_password: pass,
                  },
                }
              );
              break;
          }
          res.status(200).json({ message: "Password Successfully Updated" });
        }
      } else {
        res.status(400).json({ message: "Password Do not Match" });
      }
    } else {
      return res.status(400).json({ message: "Member not found" });
    }
  } catch (error) {
    console.log(
      "Error from userController >> change_password: ",
      error.message
    );
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function generateOtp() {
  try {
    const otp = Math.floor(Math.random() * (100000 + 1));
    return otp;
  } catch (error) {
    console.log("Error from userController >> generateOtp: ", error.message);
  }
}

async function blockuser(req, res) {
  const User = require("../models/user");
  const { UpdateAllParent } = require("../functions/function");
  try {
    const { member_id, status } = req.body;
    await User.updateOne(
      { member_id: member_id },
      {
        $set: {
          status: status,
        },
      }
    );
    if (status == 2) {
      await UpdateAllParent(member_id, -1);
      return res.status(200).json({ message: "User blocked successfully" });
    } else {
      await UpdateAllParent(member_id, 1);
      return res.status(200).json({ message: "User unblocked successfully" });
    }
  } catch (error) {
    console.log("Error from userController >> blockuser: ", error.message);
    return res.status(400).json({ error: error.message });
  }
}

async function widthdrawl(req, res) {
  const User = require("../models/user");
  const withdrawlRequests = require("../models/withdrawlRequests");
  try {
    const { member_id, amount, wallet_type } = req.body;
    const haveBalance = await User.findOne({
      member_id: member_id,
      [wallet_type]: { $gte: amount },
    });
    console.log(haveBalance);
    if (haveBalance && haveBalance[wallet_type] > 0) {
      const newRequest = await withdrawlRequests.insertMany([req.body]);
      if (newRequest) {
        await User.updateOne(
          { member_id: member_id },
          { $inc: { [wallet_type]: -amount } }
        );
        res.status(200).json({
          message: "Withdrawl request has been placed successfully.",
          fundReq: newRequest,
        });
      } else {
        res.status(400).json({ message: "Something went wrong." });
      }
    } else {
      res.status(400).json({ message: "You have insufficient balance." });
    }
  } catch (error) {
    console.log("Error from: userController >> widthdrawl", error);
    return res.status(400).json({ message: "Somthing went wrong" });
  }
}

async function manualFundRequest(req, res) {
  try {
    const up = await User.updateOne(
      { member_id: req.body.member_id },
      { $inc: { bep20_wallet: req.body.amount } }
    );
    if (up) {
      res.status(200).json({
        message: "Request to add fund has been placed successfully.",
        fundReq: newRequest,
      });
    } else {
      res.status(400).json({ message: "Something went wrong." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getManualFundRequest(req, res) {
  try {
    const manualFundRequestModel = require("../models/hi");
    const allRequests = await manualFundRequestModel
      .find(req.body)
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

async function approveFundRequest(req, res) {
  try {
    const manualFundRequestModel = require("../models/manualFundRequests");
    const updateResult = await manualFundRequestModel
      .updateOne(
        {
          _id: req.body.id,
        },
        {
          $set: {
            is_approved: req.body.status,
          },
        }
      )
      .then(async (fundRequest, error) => {
        if (error) res.status(400).json({ message: "Something went wrong." });
        if (req.body.status == 1) {
          const re = await manualFundRequestModel.findOne({ _id: req.body.id });
          const memberID = re.member_id;
          await User.updateOne(
            { member_id: memberID },
            { $inc: { bep20_wallet: re.amount } }
          );
        }

        res.status(200).json({
          message:
            req.body.status == 1
              ? "Request approved successully."
              : "Request rejected successfully.",
          fundRequest,
        });
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function supportRequest(req, res) {
  try {
    const supportRequestModel = require("../models/supportRequests");
    const newRequest = await supportRequestModel.insertMany([req.body]);
    if (newRequest) {
      res.status(200).json({
        message: "Support request has been placed successfully.",
        fundReq: newRequest,
      });
    } else {
      res.status(400).json({ message: "Something went wrong." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function sendAdminReply(req, res) {
  try {
    const supportRequestModel = require("../models/supportRequests");
    const newRequest = await supportRequestModel.updateOne(
      {
        _id: req.body.request_id,
      },
      {
        $set: {
          admin_reply: req.body.admin_reply,
        },
      }
    );
    if (newRequest) {
      res.status(200).json({
        message: "Replied successfully.",
        fundReq: newRequest,
      });
    } else {
      res.status(400).json({ message: "Something went wrong." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getSupportRequest(req, res) {
  try {
    const supportRequestModel = require("../models/supportRequests");
    const allRequests = await supportRequestModel
      .find(req.body)
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

async function changeUserPassword(req, res) {
  try {
    const { email, pass, confirm_pass } = req.body;
    if (confirm_pass === pass) {
      const userd = await User.find({
        email: email,
      });
      if (userd) {
        const hash = await bcrypt.hash(pass, 10);
        await User.updateOne(
          { email: email },
          {
            $set: {
              hash_password: hash,
              password: pass,
            },
          }
        );
        return res
          .status(200)
          .json({ message: "Password Successfully Updated" });
      } else {
        return res.status(400).json({ message: "User does not exists." });
      }
    } else {
      return res.status(400).json({ message: "Password confirmation failed." });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  signup,
  signin,
  otp_match,
  blockuser,
  updateUserInfo,
  forgetPassword,
  otp_match,
  change_password,
  widthdrawl,
  manualFundRequest,
  getManualFundRequest,
  approveFundRequest,
  supportRequest,
  getSupportRequest,
  changeUserPassword,
  sendAdminReply,
  sendEmailOTP
};
