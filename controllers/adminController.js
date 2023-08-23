import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import AdminWallet from "../models/AdminWallet.js";
import LoanPayments from "../models/LoanPayments.js";
import {getPopulatedUsers} from "../utils/utils.js";
import fs from "fs";
dotenv.config();

export const getUsers = async (req, res) => {
    let users = await getPopulatedUsers();
    return res.status(200).json({status:"Success", users}).end();
}
export const getLoans = async (req, res) => {
    let loans = await Loan.find().populate('user').populate('payments');
    return res.status(200).json({status:"Success", loans}).end();
}
export const assignWallet = async (req, res) => {
    await Loan.updateOne({ _id: req.params.id }, {
        admin_wallet:req.body.admin_wallet
    })
    return res.status(200).json({status:"Success", result:"Saved"}).end();
}
export const getWallet = async (req, res) => {
    let wallet = await AdminWallet.findOne()
    return res.status(200).json({status:"Success", wallet}).end();
}
export const saveLoanPayments = async (req, res) => {
    try {
        await LoanPayments.deleteMany({loan:req.params.id}).then(function(){
            console.log("Data deleted"); // Success
        }).catch(function(error){
            console.log(error); // Failure
        });
        let loan = await Loan.findOne({ _id: req.params.id });
        loan.payments=[];
        for(let i=0; i<req.body.billing_period.length;i++) {
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
export const saveLoanApproval = async (req, res) => {
    await Loan.updateOne({_id:req.params.id},{
        approved:req.body.approved,
    });
    return res.status(200).json({status:"Success", result:"Saved"}).end();
}
export const approveUser = async (req, res) => {
    await User.updateOne({_id:req.params.id},{
        approved:true,
    });
    return res.status(200).json({status:"Success", result:"Approved"}).end();
}
export const savePaymentCheck = async (req, res) => {
    await LoanPayments.updateOne({_id:req.params.id},{
        check:req.body.check,
    });
    return res.status(200).json({status:"Success", result:"Saved"}).end();
}
export const savePaymentNotes = async (req, res) => {
    await LoanPayments.updateOne({_id:req.params.id},{
        notes:req.body.notes,
    });
    return res.status(200).json({status:"Success", result:"Saved"}).end();
}
export const deleteUser = async (req, res) => {
    await User.deleteOne({_id:req.body.id});
    await Loan.deleteMany({user:req.body.id});
    return res.status(200).json({status:"Success", result:"Deleted"}).end();
}
export const updatePersonalInfo = async (req, res) => {
    try {
        await User.updateOne({_id: req.params.id}, {
            ...req.body,
        });
        return res.status(200).json({status: "Success", result: "Saved"}).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err).end();
    }
};
