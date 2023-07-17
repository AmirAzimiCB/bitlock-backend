import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import Wallet from "../models/Wallet.js";
import AdminWallet from "../models/AdminWallet.js";
dotenv.config();

export const getUsers = async (req, res) => {
    let users = await User.find({isAdmin:false}).populate('loans').populate('wallets');
    return res.status(200).json({status:"Success", users}).end();
}
export const getLoans = async (req, res) => {
    let loans = await Loan.find().populate('user');
    return res.status(200).json({status:"Success", loans}).end();
}

export const saveWallet = async (req, res) => {
    if(req.body?._id!=undefined && req.body?._id!=''){
        await AdminWallet.updateOne({_id:req.body._id},{
            address:req.body.address,
        });
    } else {
        let adminWallet = new AdminWallet();
        adminWallet.address = req.body.address
        adminWallet.save();
    }
    return res.status(200).json({status:"Success", result:"Saved"}).end();
}

export const getWallet = async (req, res) => {
    let wallet = await AdminWallet.findOne()
    return res.status(200).json({status:"Success", wallet}).end();
}
