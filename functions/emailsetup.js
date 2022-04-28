let nodemailer = require("nodemailer");
let AWS = require("aws-sdk");

// configure AWS SDK
AWS.config.update({
  accessKeyId: "AKIA45GDMVHKSC4R4C4T",
  secretAccessKey: "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",
  region: "us-west-2",
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: "2010-12-01",
  }),
});

// send some mail
/* transporter.sendMail(
  {
    from: "info@globaldefipool.com",
    to: "karunendumishra@gmail.com",
    subject: "Message",
    text: "I hope this message gets sent!",
  },
  (err, info) => {
    console.log("Envelope :: ", info?.envelope);
    console.log("MessageID :: ", info?.messageId);
    console.log("Error :: ", err);
  }
); */

function sendEmailOtp(to, otp) {
  const subject = "Global DEFI Pool Account Varification Code";
  const logo_url = "Global DEFI Pool";
  const website_url = "https://globaldefipool.com/";
  const website_name = "Global DEFI Pool";
  const title = "Global DEFI Pool";
  const html = generateOtpHTML(otp, to, {
    logo: logo_url,
    website: website_url,
    name: website_name,
    title,
  });
  sendMail(to, subject, html);
}

function userRagistractionMail(to, User_id, password, transuction_password) {
  //console.log(to, User_id, password, transuction_password);
  const subject = "Global DEFI Pool Account Varification Code";
  const logo_url = "Global DEFI Pool";
  const website_url = "https://globaldefipool.com";
  const website_name = "Global DEFI Pool";
  //const organisation_addr =
  //("<p>211002 STPI Prayagraj</p><p> Uttar Pradesh, India</p>");
  const title = "GlobalDEFIPool";
  const html = generateUserRagistractionHTML(
    User_id,
    password,
    transuction_password,
    {
      logo: logo_url,
      website: website_url,
      name: website_name,
      title,
    }
  );
  sendMail(to, subject, html);
}

function generateOtpHTML(otp, info) {
  let html = "";
  html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                      <div style="border-bottom:1px solid #eee">
                         <h5 style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${
                           info && info.website ? info.website : "Global DEFI Pool"
                         }</h5>
                      </div>
                      <p style="font-size:1.1em">Hi,</p>
                      <p>Thank you for choosing Global DEFI Pool. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                      <p style="font-size:0.9em;">Regards,<br />Global DEFI Pool</p>
                      <hr style="border:none;border-top:1px solid #eee" />
                  </div>
              </div>`;

  return html;
}

function generateUserRagistractionHTML(
  User_id,
  password,
  transuction_password
) {
  let html = "";
  html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                           <h5 style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">GlobalDEFI Pool</h5>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing Global DEFI Pool. Your USERID: ${User_id}, PASSWORD: ${password}, and TRANSACTION PASSWORD: ${transuction_password}</p>
                      
                        <p style="font-size:0.9em;">Regards,<br />Global DEFI Pool</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                    </div>
                </div>`;

  return html;
}

function sendMail(to, subject, message) {
  transporter.sendMail(
    {
      from: "info@globaldefipool.com",
      to: to,
      subject: subject,
      html: message,
    },
    (err, info) => {
      if (err) {
        console.log("Error in sending email :: ", err);
        return false;
      }
      if (info) {
        //console.log("Envelope :: ", info?.envelope);
        //console.log("MessageID :: ", info?.messageId);
        return { envelope: info?.envelope, messageID: info?.messageId };
      }
    }
  );
}


module.exports = {
    sendMail,
    userRagistractionMail,
    sendEmailOtp
  }