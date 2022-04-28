const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport');
/**
 * transapoter is an object, will be used in sending email from our server
 */
const testAccount = {
    user: 'AKIA45GDMVHKQC5QXV6S',
    pass: 'BLyEulm2Hu9HjwJFwF6tHxGyNCnnDwMN4QkvKJDCvr5p',
    name: 'Globle DEFI Pool'
}

let transporter = nodemailer.createTransport(smtpTransport({
    // service: 'Gmail', // if we want to youse servece
    host: 'email-smtp.us-west-2.amazonaws.com',
    port: 587,
    // secureConnection: false,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: testAccount.user,
        pass: testAccount.pass,
    },
    tls: {
        rejectUnauthorized: false
      }
}));


function sendMail(data) {
    try {
        const { to, subject } = data;
        let info = {
            from: {
                name: testAccount.name,
                address: testAccount.user
            },
            to: to,
            cc: data.cc ? data.cc : '',
            bcc: data.bcc ? data.bcc : '',
            subject: subject,
            text: data.text ? data.text : '',
            html: data.html ? data.html : '',
            attachments: data.attachments ? data.attachments : '',
            sender: data.sender ? data.sender : testAccount.user,
        };
        transporter.sendMail(info, (function (error, data) {
            if (error) {
                console.log("error occurs", error)
            } else {
                console.log("email sent", data)
            }
        }));
    } catch (error) {
        console.log("Error: from utils > mailer.js > sendMail: ", error.message);
    }
}


function sendEmailOtp(to, otp) {
    const subject = "Globle DIFFI Pool Account Varification Code";
    const logo_url = 'Globle DIFFI Pool';
    const website_url = 'https://Globle DIFFI Pool.io/';
    const website_name = 'Globle DIFFI Pool';
    const organisation_addr = '<p>211002 STPI Prayagraj</p><p> Uttar Pradesh, India</p>';
    const title = 'Globle DIFFI Pool.io';
    const html = generateOtpHTML(otp, to, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title});
    sendMail({ to, subject, html});
}

function UserRagistractionMail(to, User_id, password, transuction_password) {
    console.log(to, User_id, password, transuction_password)
    const subject = "Globle DIFFI Pool Account Varification Code";
    const logo_url = 'Globle DIFFI Pool';
    const website_url = 'https://Globle DIFFI Pool.io/';
    const website_name = 'Globle DIFFI Pool';
    const organisation_addr = '<p>211002 STPI Prayagraj</p><p> Uttar Pradesh, India</p>';
    const title = 'Globle DIFFI Pool.io';
    const html = generateUserRagistractionHTML(User_id, password, transuction_password, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title});
    sendMail({ to, subject, html});
}

function generateOtpHTML(otp, info ) {
  let html = '';
          html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                  <div style="margin:50px auto;width:70%;padding:20px 0">
                      <div style="border-bottom:1px solid #eee">
                         <h5 style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${info&&info.website?info.website:'GlobleDiffi'}</h5>
                      </div>
                      <p style="font-size:1.1em">Hi,</p>
                      <p>Thank you for choosing Globle DIFFI Pool. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
                      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
                      <p style="font-size:0.9em;">Regards,<br />Globle DIFFI Pool</p>
                      <hr style="border:none;border-top:1px solid #eee" />
                  </div>
              </div>`;
       
  return html;
}

function generateUserRagistractionHTML(User_id, password, transuction_password) {
    let html = '';
            html = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                           <h5 style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">GlobleDiffi</h5>
                        </div>
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing Globle DIFFI Pool. Your userId: ${User_id}, password: ${password}, and transuction_password: ${transuction_password}</p>
                      
                        <p style="font-size:0.9em;">Regards,<br />Globle DIFFI Pool</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                    </div>
                </div>`;
         
    return html;
  }





module.exports = {
  sendEmailOtp,
  UserRagistractionMail
}














// const nodemailer = require("nodemailer");

// // async..await is not allowed in global scope, must use a wrapperm
// async function main() {
//   // Generate test SMTP service account from ethereal.email
//   // Only needed if you don't have a real mail account for testing

//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     service:"Gmail", // true for 465, false for other ports
//     secure: true,//true
//   port: 465,
//     auth: {
//       user: "harshit.inrx@gmail.com", // generated ethereal user
//       pass: "Test@123", // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: 'harshit.inrx@gmail.com', // sender address
//     to: "thorbond2020@gmail.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: sendOtp, // html body
//   });

//   // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//   // Preview only available when sending through an Ethereal account
//   // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// }

// function sendOTP(to, otp) {
//   const subject = "GlobelDiffi Account Varification Code";
//   const logo_url = 'https://Globle DIFFI Pool.io/theme/img/logo.png';
//   const website_url = 'https://GlobelDiffi.io/';
//   const website_name = 'GlobelDiffi';
//   const organisation_addr = '<p>211002 STPI Prayagraj</p><p> Uttar Pradesh, India</p>';
//   const title = 'GlobelDiffi.io';
//   const html = generateOtpHTML(otp, to, { logo: logo_url, website: website_url, name: website_name, address: organisation_addr, title}, 1);
//   sendMail({ to, subject, html});
// }
// module.exports = {
//     main
// }

// function sendMail(data) {
//   try {
//       const { to, subject } = data;
//       let info = {
//           from: {
//               name: "harshit.inrx@gmail.com",
//               address: "Test@123"
//           },
//           to: "thorbond2020@gmail.com", // list of receivers
//           subject: "Hello ✔", // Subject line
//           text: "Hello world?", // plain text body
//       };
//       transporter.sendMail(info, (function (error, data) {
//           if (error) {
//               console.log("error occurs", error)
//           } else {
//               console.log("email sent", data)
//           }
//       }));
//   } catch (error) {
//       console.log("Error: from utils > mailer.js > sendMail: ", error.message);
//   }
// }


// generateOtpHTML = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
// <div style="margin:50px auto;width:70%;padding:20px 0">
//     <div style="border-bottom:1px solid #eee">
//         <a href="$" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"><img src="" style="max-height: 30px;" /></a>
//     </div>
//     <p style="font-size:1.1em">Your Deposit is successfully Updated.</p>
//     <p>Remark:GlobelDiffPool</p>
//     <p style="font-size:0.9em;">Regards,<br /></p>
//     <hr style="border:none;border-top:1px solid #eee" />
//     <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
//         <p>Hello Bro</p>
        
//     </div>
// </div>
// </div>`;