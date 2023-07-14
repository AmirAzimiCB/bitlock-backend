import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
dotenv.config();

export const getUsers = async (req, res) => {
    let users = await User.find({isAdmin:false}).populate('loans').populate('wallets');
    return res.status(200).json({status:"Success", users}).end();
}
export const getLoans = async (req, res) => {
    let loans = await Loan.find().populate('user');
    return res.status(200).json({status:"Success", loans}).end();
}

export const assignWallet = async (req, res) => {
    await User.updateOne({_id:req.body._id},{
        assigned_wallet:req.body.wallet,
    });
    return res.status(200).json({status:"Success", result:"Assigned"}).end();
}
