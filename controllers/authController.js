import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import {generateOTP, getUser, sendSms} from "../utils/utils.js";

dotenv.config();

export const registerUser = async (req, res) => {
    try {
        let existing_user = await User.find({
            $or: [
                {email: req.body.email},
                {phone_number: req.body.phone_number}
            ]
        });
        if (existing_user.length > 0) {
            if (existing_user[0].email == req.body.email) {
                res.status(500).json("Email Already Exists");
            } else {
                res.status(500).json("Phone Number Already Exists");
            }
        } else {
            let genOtp = generateOTP(4);
            const newUser = new User({
                first_name: req.body.name,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 2),
                phone_number: req.body.phone_number,
                is_verified: 0,
                otp: genOtp,
            });
            newUser.save();
            sendSms(req.body.phone_number, `Welcome and thank you for signing up to BitLoc. Your 4 Digit OTP Code is ${genOtp}`)
            res.status(200).json({
                status: "Success",
                result: {
                    user: newUser,
                }
            });
        }
        return;
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

export const loginUser = async (req, res) => {
    try {
        let user = await User.findOne({
            email: req.body.email,
        });
        if (!user) {
            return res.status(200).json({status: "Failure", result: "Incorrect Email or Password"});
        } else {
            if(!user.is_verified){
                let genOtp = generateOTP(4);
                await User.updateOne({_id:user._id},{
                    otp:genOtp,
                });
                user = await User.findOne({
                    email: req.body.email,
                });
                sendSms(req.body.phone_number, `Welcome and thank you for signing up to BitLoc. Your 4 Digit OTP Code is ${genOtp}`)
                return res.status(200).json({status: "OTPFailure", result: {
                        user: user,
                    }});
            }
            const passwordCorrect = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (passwordCorrect) {
                const accessToken = jwt.sign({
                        id: user._id,
                        isAdmin: user.isAdmin,
                    },
                    process.env.JWT_SEC, {
                        expiresIn: "1d"
                    }
                );
                user = await getUser(user._id);
                res.status(200).json({
                    status: "Success",
                    result: {
                        user: user,
                        accessToken: accessToken
                    }
                });
            } else {
                res.status(200).json({status: "Failure", result: "Incorrect Email or Password"});
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

export const forgotPassword = async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_KEY,
        },
    });
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            return res.status(400).json("User Not Found");
        }
        const mailOptions = {
            from: "Bitlocktest@gmail.com",
            to: req.body.email,
            subject: "Forgot Password",
            html: `
      <!doctype html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
      <title></title>
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
      #outlook a{padding:0;}body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}p{display:block;margin:0;}
      </style>
      <!--[if mso]> <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
      <![endif]-->
      <!--[if lte mso 11]>
      <style type="text/css">
      .ogf{width:100% !important;}
      </style>
      <![endif]-->
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Inter:700,500,400" rel="stylesheet" type="text/css">
      <style type="text/css">
      
      </style>
      <!--<![endif]-->
      <style type="text/css">
      @media only screen and (min-width:634px){.xc603{width:603px!important;max-width:603px;}.xc571{width:571px!important;max-width:571px;}}
      </style>
      <style media="screen and (min-width:634px)">.moz-text-html .xc603{width:603px!important;max-width:603px;}.moz-text-html .xc571{width:571px!important;max-width:571px;}
      </style>
      <style type="text/css">
      @media only screen and (max-width:633px){table.fwm{width:100%!important;}td.fwm{width:auto!important;}}noinput.mn-checkbox{display:block!important;max-height:none!important;visibility:visible!important;}
      @media only screen and (max-width:633px){.mn-checkbox[type="checkbox"]~.il{display:none!important;}.mn-checkbox[type="checkbox"]:checked~.il,.mn-checkbox[type="checkbox"]~.mn-trigger{display:block!important;max-width:none!important;max-height:none!important;font-size:inherit!important;}.mn-checkbox[type="checkbox"]~.il>a{display:block!important;}.mn-checkbox[type="checkbox"]:checked~.mn-trigger .mn-icon-close{display:block!important;}.mn-checkbox[type="checkbox"]:checked~.mn-trigger .mn-icon-open{display:none!important;}}
      </style>
      <style type="text/css">
      u+.emailify .gs{background:#000;mix-blend-mode:screen;display:inline-block;padding:0;margin:0;}u+.emailify .gd{background:#000;mix-blend-mode:difference;display:inline-block;padding:0;margin:0;}u+.emailify a,#MessageViewBody a,a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}span.MsoHyperlink{mso-style-priority:99;color:inherit;}span.MsoHyperlinkFollowed{mso-style-priority:99;color:inherit;}td.b .klaviyo-image-block{display:inline;vertical-align:middle;}
      @media only screen and (max-width:634px){.emailify{height:100%!important;margin:0!important;padding:0!important;width:100%!important;}u+.emailify .glist{margin-left:1em!important;}td.ico.v>div.il>a.l.m,td.ico.v .mn-label{padding-right:0!important;padding-bottom:16px!important;}td.x{padding-left:0!important;padding-right:0!important;}.fwm img{max-width:100%!important;height:auto!important;}.aw img{width:auto!important;margin-left:auto!important;margin-right:auto!important;}.ah img{height:auto!important;}td.b.nw>table,td.b.nw a{width:auto!important;}td.stk{border:0!important;}td.u{height:auto!important;}br.sb{display:none!important;}.thd-1 .i-thumbnail{display:inline-block!important;height:auto!important;overflow:hidden!important;}.hd-1{display:block!important;height:auto!important;overflow:visible!important;}.ht-1{display:table!important;height:auto!important;overflow:visible!important;}.hr-1{display:table-row!important;height:auto!important;overflow:visible!important;}.hc-1{display:table-cell!important;height:auto!important;overflow:visible!important;}div.r.pr-16>table>tbody>tr>td,div.r.pr-16>div>table>tbody>tr>td{padding-right:16px!important}div.r.pl-16>table>tbody>tr>td,div.r.pl-16>div>table>tbody>tr>td{padding-left:16px!important}td.v.s-8>div.il>a.l.m{padding-right:8px!important;}td.v.ico.s-8>div.il>a.l.m,td.v.ico.s-8 .mn-label{padding-bottom:8px!important;padding-right:0!important;}td.b.fw-1>table{width:100%!important}td.fw-1>table>tbody>tr>td>a{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important;}td.b.fw-1>table{width:100%!important}td.fw-1>table>tbody>tr>td{width:100%!important;padding-left:0!important;padding-right:0!important;}}
      </style>
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <!--[if gte mso 9]>
      <style>li{text-indent:-1em;}
      </style>
      <![endif]-->
      </head>
      <body lang="en" link="#DD0000" vlink="#DD0000" class="emailify" style="mso-line-height-rule:exactly;word-spacing:normal;background-color:#f5f5f5;"><div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;</div><div class="bg" style="background-color:#f5f5f5;" lang="en">
      <!--[if mso | IE]>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="none" style="width:635px;" width="635"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
      <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:635px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="none" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:71px 16px 0px 16px;text-align:left;">
      <!--[if mso | IE]>
      <table role="none" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:603px;">
      <![endif]--><div class="xc603 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
      <table border="0" cellpadding="0" cellspacing="0" role="none" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="center" class="i  m" style="font-size:0;padding:0;padding-bottom:16px;word-break:break-word;">
      <table border="0" cellpadding="0" cellspacing="0" role="none" style="border-collapse:collapse;border-spacing:0;"><tbody><tr><td style="width:138px;"> <img alt src="https://e.hypermatic.com/601835ae88fec457f3c73ad0a3d24bf2.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title width="138" height="auto">
      </td></tr></tbody></table>
      </td></tr><tr><td align="center" class="v  s-8 m" style="font-size:0;padding-bottom:16px;word-break:break-word;"><div class="il" style>
      <!--[if mso | IE]>
      <table role="none" border="0" cellpadding="0" cellspacing="0" align="center"><tr></tr></table>
      <![endif]--></div>
      </td></tr><tr><td align="center" class="x" style="font-size:0;padding-bottom:0;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:121%"><span style="font-size:19px;font-family:Inter,Arial,sans-serif;font-weight:500;color:#000000;line-height:121%;">You can now reset your password</span></p></div>
      </td></tr></tbody></table></div>
      <!--[if mso | IE]>
      </td></tr></table>
      <![endif]-->
      </td></tr></tbody></table></div>
      <!--[if mso | IE]>
      </td></tr></table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="none" style="width:635px;" width="635"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
      <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:635px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="none" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:18px 16px 0px 16px;text-align:left;">
      <!--[if mso | IE]>
      <table role="none" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:603px;">
      <![endif]--><div class="xc603 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
      <table border="0" cellpadding="0" cellspacing="0" role="none" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td class="s  m" style="font-size:0;padding:0;padding-bottom:8px;word-break:break-word;"><div style="height:4px;line-height:4px;">&#8202;</div>
      </td></tr><tr><td align="center" vertical-align="middle" class="b  fw-1" style="font-size:0;padding:0;padding-bottom:0;word-break:break-word;">
      <table border="0" cellpadding="0" cellspacing="0" role="none" style="border-collapse:separate;width:154px;line-height:100%;"><tbody><tr><td align="center" bgcolor="#1ebc92" role="none" style="border:none;border-radius:60px 60px 60px 60px;cursor:auto;mso-padding-alt:12px 0px 12px 0px;background:#1ebc92;" valign="middle"> <a href="https://Bitlock.ca/reset-password/${user._id}" style="display:inline-block;width:154px;background:#1ebc92;color:#ffffff;font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:normal;line-height:100%;margin:0;text-decoration:none;text-transform:none;padding:12px 0px 12px 0px;mso-padding-alt:0;border-radius:60px 60px 60px 60px;" target="_blank"> <span style="font-size:14px;font-family:Inter,Arial,sans-serif;font-weight:700;color:#ffffff;line-height:121%;text-decoration:underline;">Reset Password</span></a>
      </td></tr></tbody></table>
      </td></tr></tbody></table></div>
      <!--[if mso | IE]>
      </td></tr></table>
      <![endif]-->
      </td></tr></tbody></table></div>
      <!--[if mso | IE]>
      </td></tr></table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="none" style="width:635px;" width="635"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
      <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:635px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="none" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:32px 32px 32px 32px;text-align:left;">
      <!--[if mso | IE]>
      <table role="none" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:571px;">
      <![endif]--><div class="xc571 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
      <table border="0" cellpadding="0" cellspacing="0" role="none" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="center" class="x" style="font-size:0;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:150%"><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;">Didn&rsquo;t ask for a new password? You can ignore this email</span></p></div>
      </td></tr></tbody></table></div>
      <!--[if mso | IE]>
      </td></tr></table>
      <![endif]-->
      </td></tr></tbody></table></div>
      <!--[if mso | IE]>
      </td></tr></table>
      <![endif]--></div>
      </body>
      </html>
        `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        res.status(201).json({
            success: true,
            message: "Email sent to the user for password update",
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export const checkEmailPhone = async (req, res) => {
    if (req.body?.email != undefined) {
        let user = await User.findOne({email: req.body.email});
        if (user?._id != undefined) {
            return res.status(200).json({status: "Failure", result: "Already Exists"}).end();
        }
    } else {
        let user = await User.findOne({phone_number: req.body.phone_number});
        if (user?._id != undefined) {
            return res.status(200).json({status: "Failure", result: "Already Exists"}).end();
        }
    }
    return res.status(200).json({status: "Success", result: "OK"}).end();
};

export const verifyOTP = async (req, res) => {

    try {
        const user = await User.findOne({
            _id: req.body._id,
        });
        if (!user) {
            return res.status(200).json({status: "Failure", result: "User Not found"});
        } else {
            if (req.body.otp === user?.otp) {
                await User.updateOne({_id:req.body._id},{
                    is_verified:true,
                });
                res.status(200).json({
                    status: "Success",
                    result: {
                        user: user,
                    }
                });
            } else {
                res.status(200).json({status: "Failure", result: "Incorrect Otp"});
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

export const resendOtp = async (req, res) => {
    let genOtp = generateOTP(4);
    await User.updateOne({_id:req.params.id},{
        otp:genOtp,
    });
    const user = await User.findOne({
        _id: req.params._id,
    });
    sendSms(user.phone_number, `Welcome and thank you for signing up to BitLoc. Your 4 Digit OTP Code is ${genOtp}`)
    return res.status(200).json({status:"Success", result:"Sent"}).end();
}
