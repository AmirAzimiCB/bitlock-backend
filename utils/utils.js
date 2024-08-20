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
export const sendEmail = (email, data = null, template = null, subject = null) => {
  // Read the HTML email template from a file
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
