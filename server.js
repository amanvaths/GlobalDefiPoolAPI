const express = require("express");
const fileupload = require("express-fileupload");
const env = require("dotenv");
const cors = require("cors");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cron = require("node-cron");

const app = express();

// routes
const userRoutes = require("./routers/userRoute");
const adminRoutes = require("./routers/admin/adminRouter");

const user = require("./models/user");
const { main, sendOTP } = require("./functions/mailer");
const { createIncomeHistory } = require("./functions/function");
const { rCm } = require("./Controllers/pinissueController");

// mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.fqkuj.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority

app.use(
  cors({
    origin: "*",
  })
);

// invoirment variable
env.config();

// create mongoose connection
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.ib472.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database Connected");
  });

app.use(bodyParser.json());
app.use(fileupload({}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const requestTime = async function (req, res, next) {
  const RouteParams = require("./models/RouteParams");
  const data = req.route;
  //console.log(req);
  //await RouteParams.insertMany([{routePath: data.path, details: JSON.stringify(data)}]);
  next()
}

app.use(requestTime)

app.use("/api", userRoutes);
app.use("/api", adminRoutes);


async function sendMonthlyROI(dt = null) {
  const CashbackModel = require("./models/cashback");
  const UserModel = require("./models/user");
  const tDate = dt ? new Date(dt) : new Date();
  console.log("ROI Date",tDate);
  const stakings = await CashbackModel.find({ paidMonth: { $lt: 18 } });
  const a = stakings.map(async (stackData) => {
    const stDate = new Date(
      new Date(stackData.createdAt).setUTCHours(0, 0, 0, 0)
    );
    const ltDate = new Date(
      new Date(stackData.last_cashback_date).setUTCHours(0, 0, 0, 0)
    );
    if (
      tDate.getMonth() == ltDate.getMonth() &&
      tDate.getFullYear() == ltDate.getFullYear()
    ) {
      console.log("already paid");
    } else if (stDate.getDate() == tDate.getDate()) {
      console.log("Pay ROI", stDate);
      /* await CashbackModel.updateOne(
        {
          _id: stackData._id,
        },
        { $inc: { paidMonth: 1, paidCashback: stackData.monthly_cashback } },
        { $set: { last_cashback_date: tDate } }
      );
      await UserModel.updateOne(
        { member_id: stackData.member_id },
        { $inc: { cashback_wallet: stackData.monthly_cashback } }
      );
      const CashbackHistoryModel = require("./models/cashback_history");
      await CashbackHistoryModel.insertMany([
        {
          cashback_date: new Date(),
          staking_id: stackData._id,
          member_id: stackData.member_id,
          staking_amount: stackData.plan_amount,
          cashback_amount: stackData.monthly_cashback,
        },
      ]); */
    } else {
      console.log("Don't pay roi");
    }
  });
  Promise.all(a).then(() => {
    //console.log("Stakings :: ", stakings);
  });
}

async function resetCashbackAmount() {
  const CashbackModel = require("./models/cashback");
  const UserModel = require("./models/user");
  const stakings = await CashbackModel.find({});
  const a = stakings.map(async (stackData) => {
    await CashbackModel.updateOne(
      {
        _id: stackData._id,
      },
      {
        $set: {
          paidCashback: 0,
          paidMonth: 0,
          last_cashback_date: stackData.createdAt,
        },
      }
    );
    await UserModel.updateOne(
      { member_id: stackData.member_id },
      { $set: { cashback_wallet: 0 } }
    );
  });
  Promise.all(a).then(() => {
    console.log("Stakings :: ", stakings);
  });
}
//sendMonthlyROI('4-22-2022');
//resetCashbackAmount();


cron.schedule("0 0 0 * * *", async () => {
  //await generateDailyCashback();
  //await sendMonthlyROI();
  console.log("CronJob", new Date());
  sendMonthlyROI(new Date());
});


// const to = "harshitdubey1996@gmail.com",
// const otp = "1234567"

// sendOTP("harshitdubey1996@gmail.com", 1234567)
/* const { incomDistribute } = require("./Controllers/pinissueController");
incomDistribute("XCEL1000009").then((allParents) => {
  let dt = allParents;
  dt.sort((a, b) => (a.ParentNo > b.ParentNo ? 1 : -1));
  console.log(dt);
  let distinctData = [];
  let lastPaidLevel = null;
  for (parent of dt) {
    if (parent.level > lastPaidLevel || lastPaidLevel==null) {
      lastPaidLevel = parent.level;
      distinctData.push(parent);
    }
  }
  console.log(distinctData);
}); */



//rCm("XCEL1000004", 1000);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
