const { check, validationResult } = require("express-validator");
exports.validateSignUpRequest = [
  check("email")
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
    .withMessage("Enter a valid email"),
  // check('password')
  // .isLength({ min: 8})
  // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/)
  // .withMessage('password must be at least 8 character long and must contains at least one uppercase, lowercase, special character and number.')
];

exports.validateSignInRequest = [
  check("email").notEmpty().withMessage("username or email is required"),
  check("password").notEmpty().withMessage("password is required"),
];

exports.isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res.status(400).json({ errors: errors.array()[0].msg });
  }
  next();
};

exports.validateTransaction = async (req, res, next) => {
  const UserModal = require("../models/user");
  const { member_id, txn_password } = req.body;
  const user = await UserModal.findOne({
    member_id: member_id,
    txn_password: txn_password,
  });
  if (!user) {
    return res.status(400).json({
      message:
        "Transaction verification failed, incorrect transaction password try again.",
    });
  }
  next();
};

exports.validateSteking = async (req, res, next) => {
  const UserModal = require("../models/History");
  const { member_id } = req.body;
  const user = await UserModal.findOne({
    member_id: member_id,
    income_type: "ID Activation"
  });
  if (user) {
    return res.status(400).json({
      message:
        "You can not stek more than once.",
    });
  }
  next();
};

