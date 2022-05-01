const express = require("express");
const router = express.Router();
const {
  signin,
  signup,
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
} = require("../../Controllers/admin/adminController");
const { blockuser } = require("../../Controllers/userController");
const { requireSignin, verifyOTP } = require("../../common-middleware/index")



router.post("/admin/signin",/*verifyOTP,*/ signin);
router.post("/admin/blockuser", requireSignin, blockuser); // block user
router.post("/userInfo", userInfo);
router.post("/getIncomeHistory", requireSignin, getIncomeHistory); // getIncome_History
router.post("/getFundTransferHistory", requireSignin, getFundTransferHistory); // getFundTransferHistory
router.get("/dashboarddata", requireSignin, getDashboardData);
router.post("/credit_wallet", requireSignin, adminTouser);  // fund transfer by admin
router.post("/debit_wallet", requireSignin, debitWallet);  // fund transfer by admin
router.post("/update_rank", requireSignin, updateUserLevelByAdmin); // level update by admin
router.post("/all_withdrawl_requests", requireSignin, getWithdrawlRequest);
router.post("/approve_withdrawl_request", requireSignin, approveWithdrawlRequest);
router.post("/reject_withdrawl_request", requireSignin, rejectWithdrawlRequest);
router.post("/change_min_max_topup_amount", requireSignin, changeMinMaxTopupAmount);
router.post("/generate_new_address", requireSignin, generateNewAddress);
router.post("/change_admin_password", requireSignin, changeAdminPassword);
router.post("/getstatistics", requireSignin, getStasticsData);
router.post("/datewise_withdraw_req", requireSignin, getDateWiseWithdrawReq);
router.post("/getStackingBonusReport", requireSignin, getStackingBonusReport);
router.post("/rankWiseMembers", requireSignin ,rankWiseMembers);
router.post("/deleteDepositAddress", requireSignin ,deleteDepositAddress);
router.post('/makeAnnouncement', requireSignin ,makeAnnouncement);
router.post("/getAllAnnouncement", requireSignin,getAllAnnouncement);



module.exports = router;
