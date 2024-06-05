import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import multer from "multer";
import fetch from "node-fetch";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import fs from "fs";
import ejs from "ejs";
import LoanPayments from "../models/LoanPayments.js";
import speakeasy from "speakeasy";

dotenv.config();

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    /*Appending extension with original name*/
    cb(null, Date.now() + "." + getExtension(file.originalname));
  },
});

export let uploadFile = multer({
  storage: storage,
});

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_KEY,
  },
});

export let getExtension = (filename) => {
  return filename.split(".").pop();
};

export const forgotPasswordMail = (req, user) => {
  return {
    from: "info@bitloc.io",
    to: req.body.email,
    subject: "Forgot Password",
    html: `
      <div>
        <h2>Forgot Password?</h2>
        <p>Click this link to reset your password/p>
        <div>
          <a href="https://Bitlock.ca/reset-password/${user._id}">Reset Password Page</a>
        </div>
      </div>
      `,
  };
};

// new users and child accounts welcome email
export const sendSignupEmail = (email) => {
  const mailOptions = {
    from: "info@bitloc.io",
    to: email,
    subject: "Welcome to Bitlock",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
        <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;600;700&display=swap" rel="stylesheet">
        <title>Bitlock</title>
      </head>
      <body style="width: 800px; color:black; font-family: Arial, Helvetica, sans-serif; margin:0 auto;">
        <main style="width: 430px; padding:4rem; margin: 0 auto; ">
          <img src="https://i.postimg.cc/28jBQMZ8/image-48.png" alt="logo" style="width: 138px; height:29px; ">
          <h1 style=" font-size: 60px; font-weight: 500;color:black;max-width:611px;">
            Fall in love with your new doctor’s office
          </h1>
          <div style=" font-size: 1rem; font-weight: 500 ; font-family: Arial, Helvetica, sans-serif;margin-top: 1rem;">
            <p>Welcome to Canada’s first online medical platform.</p>
            <p>
              To use your multiple Bitlock benefits simply visit <a href="www.Bitlock.ca" style="text-decoration: none; color: black;">www.Bitlock.ca</a> and
              click on sign on. Once logged into your dashboard you can navigate any
              of your services.
            </p>
            <p>Its that easy to Never wait for a Doctor again.</p>
          </div>

          <a href="https://Bitlock.ca/login
          " style="text-decoration: none; color: black;">
            <img src="https://i.postimg.cc/wTcYp4fJ/button.png" alt="" style="
                width: 196px;
                margin-top: 0.5rem;
                cursor: pointer;
              "></a>
          <!-- big image -->
          <img src="https://i.postimg.cc/MKXV7qdR/highres-transformed.jpg" alt="big_image" style="width: 100%; margin-top: 1rem; background-position: center; background-size: cover;">
          <!-- hr -->
          <img src="https://i.postimg.cc/T3LjbFz5/pnnafterimage.png" alt="" style="max-width: 100%; height: 0.1vmax">
          <h3 style="font-size: 24px; font-weight: 700; ">
            Here are 6 reasons why people love Bitlock:
          </h3>
          <!-- 6 reasons -->
            <div style="display: flex; gap: 1.5rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/SRnR5F7W/layer1.png" alt="first" style="width: 1rem;margin-left:0.3rem;">
              <p style="

                  font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1.8rem;

                ">
                24/7 on-demand care
              </p>
              </div>

            <div style="display: flex; gap: 1.2rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/jSbNW24m/layer2.png " alt="2nd" style="width: 2rem; margin-left:-.8rem;">
              <p style="
               font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1rem;

                ">
                A trusted source for COVID-19 care, advice, and testing
              </p>
            </div>
            <div style="display: flex; gap: 1.1rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/2jWV4myD/layer3.png" alt="3rd" style="width:2rem; margin-left: -0.7rem;">
              <p style="
         font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1.1rem;

                ">
                Easy prescription requests and fast delivery
              </p>
            </div>
            <div style="display: flex;  gap: 1rem; align-items: center; margin-top: 1rem;">
              <img src="https://i.postimg.cc/vTyMrJ2Y/layer4.png" alt="first" style="width: 2rem; margin-left: -0.7rem;">
              <p style="
                   font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1rem;

                ">
                Easy access to appointments with specialists
              </p>
            </div>
            <div style="display: flex; gap: 1.2rem; align-items: center;margin-top: 1rem; ">
              <img src="https://i.postimg.cc/L8wcBdhc/layer5.png" alt="first" style="width: 1.8rem; margin-left: -0.6rem;">
              <p style="
              font-size: 0.7rem;;
                  font-weight: 500;
                  margin-left:1.2rem;


                ">
                Drop-in or mobile affordable lab services
              </p>
            </div>
            <div style="display: flex;gap: 1.1rem; align-items: center; margin-top: 1rem; ">
              <img src="https://i.postimg.cc/TPvk3TK3/layer6.png" alt="first" style="width: 2rem; margin-left: -0.7rem;">
              <p style="
                   font-size: 0.7rem;
                  font-weight: 500;
                  margin-left:1.1rem;

                ">
                Mobile nurses and homecare workers that come to you
              </p>
            </div>

          <!-- footer -->
          <div style="width: 100%; padding: 5rem 0; font-family: Arial, Helvetica, sans-serif; color: black;">
            <p style="font-size: 16px;line-height: 1.2rem;">
              For additional support email our support team at
              <a href="info@Bitlock.ca" style="text-decoration: none; color: black; font-weight: 800;">info@Bitlock.ca</a> Or
              access our live chat on
              <a href="https://www.google.com/search?q=www.Bitlock.ca&sxsrf=APwXEddA70737pHBsAKSOQcBT_SyAv6o_g%3A1684518281604&ei=ibVnZNXIJJvj4-EPt_yZiAI&ved=0ahUKEwiVsavO94H_AhWb8TgGHTd-BiEQ4dUDCA8&uact=5&oq=www.Bitlock.ca&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQA0oECEEYAFAAWABg2RdoAHAAeACAAXaIAXaSAQMwLjGYAQCgAQKgAQHAAQE&sclient=gws-wiz-serp" style="text-decoration: none; color: black; font-weight: 800;">www.Bitlock.ca</a>
            </p>
            <p style="margin-top: 2rem; font-size: 16px;">
              We look forward to being a support for you your family and company!
            </p>
            <p style="margin-top:2rem; padding-bottom: 5rem; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">
              The Care team
              <a href="https://Bitlock.ca/" style="text-decoration: none; color: black; font-weight: 800; font-size: 20px;">@Bitlock.CA</a>
            </p>
          </div>
        </main>
      </body>
    </html>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        res.status(403).json("Token is not valid!");
        return;
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

export const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

export const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

export const sendSms = (number, text) => {
  let userName = "bitloc.io";
  let apiKey = "CA68B379-0C28-D95F-B5F9-96263D4A1699";
  fetch("https://api-mapper.clicksend.com/http/v2/send.php", {
    method: "POST",
    body: new URLSearchParams({
      username: userName,
      key: apiKey,
      method: "http",
      to: "+1" + number,
      message: text,
    }),
  }).then((r) => {
    // console.log(parseXmlToJson(r));
  });
};

const parseXmlToJson = (xml) => {
  const json = {};
  for (const res of xml.matchAll(
    /(?:<(\w*)(?:\s[^>]*)*>)((?:(?!<\1).)*)(?:<\/\1>)|<(\w*)(?:\s*)*\/>/gm
  )) {
    const key = res[1] || res[3];
    const value = res[2] && parseXmlToJson(res[2]);
    json[key] = (value && Object.keys(value).length ? value : res[2]) || null;
  }
  return json;
};

export const generateOTP = (length = 4) => {
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
};

export let getUser = async (id) => {
  let user = await User.findOne({ _id: id })
    .populate({
      path: "wallet_groups",
      populate: {
        path: "wallets",
      },
      match: { status: 1 }, // Only populate wallet_groups with status 1
    })
    .populate({
      path: "banks",
      match: { status: 1 }, // Only populate banks with status 1
    });
  return user;
};

export let getPopulatedUsers = async () => {
  let user = await User.find({ isAdmin: false })
    .populate({
      path: "wallet_groups",
      populate: {
        path: "wallets",
      },
    })
    .populate("banks")
    .populate("loans");
  return user;
};
// new users and child accounts welcome email
export const sendEmail = (
  email,
  data = null,
  template = null,
  subject = null
) => {
  // Read the HTML email template from a file
  console.log(`utils/${template}`);
  const source = fs.readFileSync(`utils/${template}`, "utf-8");

  const html = ejs.render(source, {
    name: data?.first_name,
    walletName: data?.walletName,
    _id: data?._id,
  });

  const mailOptions = {
    from: "info@bitloc.io",
    to: email,
    subject: subject,
    html: html,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    console.log("gmail Auth", process.env.GMAIL_EMAIL, process.env.GMAIL_KEY);
    if (error) {
      console.log("error", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// Send Admin Notification
export const sendAdminEmail = (
  user,
  data = null,
  template = null,
  subject = null
) => {
  // Read the HTML email template from a file
  console.log(`utils/${template}`);
  const source = fs.readFileSync(`utils/${template}`, "utf-8");
  var date = new Date().toJSON().slice(0, 19).replace("T", ":");
  const html = ejs.render(source, {
    name: user?.first_name,
    emailAddress: user?.email,
    phoneNumber: user?.phone_number,
    loanAmount: data?.borrow_amount,
    loanDate: date,
  });

  const mailOptions = {
    from: "info@bitloc.io",
    to: "info@bitloc.io",
    subject: subject,
    html: html,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    console.log("gmail Auth", process.env.GMAIL_EMAIL, process.env.GMAIL_KEY);
    if (error) {
      console.log("error", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export const emailsCron = async (req, res) => {
  await loanReminder();
  return res
    .status(200)
    .json({ status: "Success", result: "Cron Completed Successfully" })
    .end();
};

const loanReminder = async () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  console.log("currentDate", formattedDate);
  const loans = await LoanPayments.find({
    date: formattedDate,
    paid: null,
  }).populate({
    path: "loan",
    populate: [{ path: "user" }, { path: "bank" }],
  });
  loans.forEach((loan) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      loan?.date
    );
    const source = fs.readFileSync(`utils/loan_reminder.ejs`, "utf-8");
    const html = ejs.render(source, {
      name: loan?.loan?.user?.first_name,
      paymentDue: loan?.payment_due,
      date: formattedDate,
      account: loan?.loan?.bank?.account_number,
    });
    const mailOptions = {
      from: "Bitlocktest@gmail.com",
      to: loan?.loan?.user?.email,
      subject: "Interest Payment - Reminder for Your Upcoming Payment",
      html: html,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      console.log("gmail Auth", process.env.GMAIL_EMAIL, process.env.GMAIL_KEY);
      if (error) {
        console.log("error", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  });
};
