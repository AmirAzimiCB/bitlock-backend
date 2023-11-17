import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import {generateOTP, getUser, sendEmail, sendSms} from "../utils/utils.js";
import speakeasy from "speakeasy";

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
            if (!user.is_verified) {
                let genOtp = generateOTP(4);
                await User.updateOne({_id: user._id}, {
                    otp: genOtp,
                });
                user = await User.findOne({
                    email: req.body.email,
                });
                sendSms(req.body.phone_number, `Welcome and thank you for signing up to BitLoc. Your 4 Digit OTP Code is ${genOtp}`)
                return res.status(200).json({
                    status: "OTPFailure", result: {
                        user: user,
                    }
                });
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
                if(user?.auth2FaEnabled === true){
                    res.status(200).json({
                        status: "Success",
                        result: {
                            user: user,
                        }
                    });
                    return;
                }
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

export const verify_otp = async (req, res) => {
    let user = await getUser(req.body.id);
    let verified = speakeasy.totp.verify({
        secret: user.auth2FaSecret,
        encoding: 'hex',
        token: req.body.code,
    })
    if (verified) {
        const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SEC, {
                expiresIn: "1d"
            }
        );
        res.status(200).json({
            status: "Success",
            result: {
                user: user,
                accessToken: accessToken
            }
        });
    } else {
        return res.status(200).json({status: "failure", error: "Unable to verify"}).end();
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) {
            return res.status(400).json("User Not Found");
        }
        sendEmail(req?.body?.email, user, 'forgotPassword.ejs', 'Forgot Password - Reset Your BitLoc Account Password')
    } catch (error) {
        return res.status(500).json(error);
    }
    return res.status(200).json({status: "Success", result: "Email sent to the user for password update"}).end();
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


export const resetPassword = async (req, res) => {
    try {
        let existing_user = await User.findOne({_id: req.params.id});
        if (existing_user) {
            existing_user.password = bcrypt.hashSync(req.body.new_password, 2)
            existing_user.save();
            return res.status(200).json({status: "Success", result: "Password Changed"}).end();
        } else {
            return res.status(200).json({status: "Failure", result: "The link is Expired"}).end();
        }

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
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
                await User.updateOne({_id: req.body._id}, {
                    is_verified: true,
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
    await User.updateOne({_id: req.params.id}, {
        otp: genOtp,
    });
    const user = await User.findOne({
        _id: req.params.id,
    });
    await sendSms(user?.phone_number, `Welcome and thank you for signing up to BitLoc. Your 4 Digit OTP Code is ${genOtp}`)
    return res.status(200).json({status: "Success", result: "Sent"}).end();
}
