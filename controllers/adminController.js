import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import AdminWallet from "../models/AdminWallet.js";
import LoanPayments from "../models/LoanPayments.js";
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

export const saveLoanPayments = async (req, res) => {
    return res.status(200).json({...req.body}).end();
    try {
        await LoanPayments.deleteMany({loan:req.params.id}).then(function(){
            console.log("Data deleted"); // Success
        }).catch(function(error){
            console.log(error); // Failure
        });
        let loan = await Loan.findOne({ _id: req.params.id });
        loan.payments=[];
        for(let i=0; i<req.body.address.length;i++) {
            const loanPayments = new LoanPayments({
                billing_period:req.body.billing_period[i],
                payment_due:req.body.payment_due[i],
                date:req.body.date[i],
                remaining_principle:req.body.remaining_principle[i],
                loan
            });
            loanPayments.save();
            loan.payments.push(loanPayments._id)
        }
        loan.save();
        console.log("saved");
        return res.status(200).json({status:"Success", result:"Saved"}).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err).end();
    }
}
