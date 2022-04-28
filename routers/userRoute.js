const express = require("express");
const { requireSignin, verifyOTP } = require("../common-middleware");
const {
  creacteTopup,
  fundTransferUserToUser,
  currentInvestment,
  createInvestment,
  getTopUpInvestment,
  getcreateInvestment,
  fundInvestmentToCoin,
  getCashback,
  getRoyaltyIncomes
} = require("../Controllers/pinissueController");

const {
  signup,
  signin,
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
  sendAdminReply,
  changeUserPassword,
  sendEmailOTP
} = require("../Controllers/userController");
const { diret_and_direct_childlength } = require("../functions/function");
const {
  isRequestValidated,
  validateSignUpRequest,
  validateSignInRequest,
  validateTransaction,
  validateSteking
} = require("../validator/auth");
const router = express.Router();

// authantication
router.post("/signup", signup);
router.post("/signin", validateSignInRequest, isRequestValidated, signin);
router.post("/updateUserInfo", requireSignin, updateUserInfo);
router.post("/forgot", forgetPassword);
router.post("/otp_match", otp_match);
router.post("/change_password", isRequestValidated, requireSignin, change_password);
router.post("/change_user_password", requireSignin , changeUserPassword);
router.post("/forget_password", verifyOTP , changeUserPassword);

// pin issue and fund
router.post("/investment", requireSignin,createInvestment);
router.post("/getcreateInvestment", requireSignin, getcreateInvestment);
router.post("/createTopup", requireSignin, validateSteking,validateTransaction, creacteTopup);
router.post(
  "/fundTransferUserToUser",
  requireSignin,
  validateTransaction,
  fundTransferUserToUser
);
router.post("/currentInvestment", requireSignin, getTopUpInvestment);
router.post("/widthdrawl",requireSignin, validateTransaction, widthdrawl);
router.post("/getCashback",requireSignin, getCashback);
router.post("/fundInvestmentToCoin",requireSignin, validateTransaction,fundInvestmentToCoin);

// test rout
router.post("/diret_and_direct_childlength",requireSignin, diret_and_direct_childlength);
router.post("/add_manual_fund",requireSignin, manualFundRequest)
router.post("/all_manual_fund_requests",requireSignin, getTopUpInvestment)
router.post("/approve_fund_request",requireSignin, approveFundRequest)
router.post("/place_support_request",requireSignin, supportRequest);
router.post("/send_admin_reply",requireSignin, sendAdminReply);
router.post('/getSupportRequests',requireSignin, getSupportRequest);
router.post('/getRoyaltyIncomes',requireSignin, getRoyaltyIncomes);
router.post('/sendotp', sendEmailOTP);
router.get("/testapp", (req, res)=>{res.json({message:"Hello"})});

router.post("/check_income_distribution",requireSignin, async (req, res) => {
  //GDP1000258;
  const { incomDistribute } = require("../Controllers/pinissueController");
  const topupAmount = req.body.topupAmount;
  const mID = req.body.memberID;//"GDP1000370"; //"GDP1005185";//"GDP1005056";//"GDP1005185";//"GDP1004804"
  const allParents = await incomDistribute(mID);
  console.log("All Parent to be paid :: ", allParents);

  const percentage = [5, 10, 15, 20, 25, 30];
  const UserModal = require("../models/user");
  const incomeType = "Rank Bonus";
 /*  allParent.forEach((parent, index) => {
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
      console.log(
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
      );
    } else {
      rcPer = percentage[parent.level];
      diffPer =
        percentage[parent.level] - percentage[distinctData[index - 1].level];
      rcAmount = (amount * rcPer) / 100;
      diffAmount = (amount * diffPer) / 100;
      sponsorProfit = diffAmount;
      incomeWallet = Number(diffAmount / 2);
      coinWallet = Number(diffAmount / 2);
      console.log(
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
      );
    }
  }  */
  res.json({topupAmount, allParents})
});

module.exports = router;
