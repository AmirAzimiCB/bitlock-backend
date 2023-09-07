import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import Wallet from "../models/Wallet.js";
import * as fs from "fs";
import AdminWallet from "../models/AdminWallet.js";
import WalletGroup from "../models/WalletGroup.js";
import Bank from "../models/Bank.js";
import {getUser} from "../utils/utils.js";
import LoanPayments from "../models/LoanPayments.js";
import bcrypt from "bcrypt";

dotenv.config();

export const checkLogin = async (req, res) => {
    let user = await getUser(req.user.id);
    return res.status(200).json({status: "Success", user}).end();
}
export const updatePersonalInfo = async (req, res) => {
    let gid = [];
    if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
            gid[i] = req.files[i].filename;
        }
    }
    if (req.body?.removed_images != undefined) {
        req.body.removed_images.forEach((item) => {
            fs.rmSync("uploads/" + item, {
                force: true,
            });
        });
    }
    try {
        if (gid.length > 0) {
            if (req.body?.old_images != undefined) {
                gid.push(...req.body.old_images);
            }
            let government_issued_identification = gid.join();
            await User.updateOne({_id: req.params.id}, {
                government_issued_identification: government_issued_identification,
                ...req.body,
            });
        } else {
            if (req.body?.old_images != undefined) {
                gid.push(...req.body.old_images);
            }
            let government_issued_identification = gid.join();
            await User.updateOne({_id: req.params.id}, {
                government_issued_identification: government_issued_identification,
                ...req.body,
            });
        }
        let user = await User.findOne({_id: req.params.id});
        return res.status(200).json({status: "Success", user: user}).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err).end();
    }
};
export const updateBankingInfo = async (req, res) => {
    try {
        let user = await User.findOne({_id: req.params.id});
        if (req.body?.id != undefined) {
            await Bank.updateOne({_id: req.body.id}, {
                ...req.body,
            });
        } else {
            let bank = new Bank({...req.body});
            bank.save();
            user.banks.push(bank._id);
            user.save();
        }
        let updated_user = await getUser(user._id);
        return res.status(200).json({status: "Success", result: "Saved", user:updated_user}).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err).end();
    }
};
export const applyLoan = async (req, res) => {
    console.log(req.body);
    try {
        let user = await User.findOne({_id: req.params.id});
        const loan = new Loan({
            ...req.body,
        });
        loan.user = user;
        loan.save();
        user.loans.push(loan._id)
        user.save();
        return res.status(200).json("Success").end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err).end();
    }
}
export const uploadIdentityFiles = async (req, res) => {
    let gid = [];
    if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
            gid[i] = req.files[i].filename;
        }
    }
    if (gid.length > 0) {
        let fileNames = gid.join();
        try {
            await User.updateOne({_id: req.params.id}, {
                identity_files: fileNames,
            });
            let user = await User.findOne({_id: req.params.id});
            return res.status(200).json({status: "Success", user: user}).end();
        } catch (err) {
            console.log(err);
            return res.status(500).json(err).end();
        }
    } else {
        let user = await User.findOne({_id: req.params.id});
        return res.status(200).json({status: "Success", user: user}).end();
    }
};
export const getMyLoans = async (req, res) => {
    let loans = await Loan.find({user: req.params.id, approved: 'Approved'}).populate('payments');
    return res.status(200).json({status: "Success", loans}).end();
}
export const getMyPendingLoans = async (req, res) => {
    let loans = await Loan.find({user: req.params.id, approved: null}).populate('payments');
    return res.status(200).json({status: "Success", loans}).end();
}
export const saveWallet = async (req, res) => {
    try {
        let user = await User.findOne({_id: req.params.id});
        let walletGroup = null
        if (req.body?.id != undefined) {
            walletGroup = await WalletGroup.findOne({_id: req.body.id});
            walletGroup.group_name = req.body.group_name;
            walletGroup.wallets = [];
            await Wallet.deleteMany({wallet_group: req.body.id});
        } else {
            walletGroup = new WalletGroup(
                {
                    group_name: req.body.group_name,
                    wallets: [],
                    user
                }
            );
            user.wallet_groups.push(walletGroup._id)
            user.save();
        }
        for (let i = 0; i < req.body.address.length; i++) {
            const wallet = new Wallet({
                address: req.body.address[i],
                percentage: req.body.percentage[i],
                wallet_group: walletGroup._id
            });
            wallet.save();
            walletGroup.wallets.push(wallet._id)
        }
        walletGroup.save();
        user = await getUser(user._id);
        return res.status(200).json({status: "Success", result: "Saved", user}).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json(err).end();
    }
}
export const getMyWallets = async (req, res) => {
    let walletGroups = await WalletGroup.find({user: req.params.id}).populate('wallets');
    return res.status(200).json({status: "Success", walletGroups}).end();
}
export const getAdminWallet = async (req, res) => {
    let wallet = await AdminWallet.findOne()
    return res.status(200).json({status: "Success", wallet}).end();
}
export const savePaymentPaid = async (req, res) => {
    await LoanPayments.updateOne({_id: req.params.id}, {
        paid: req.body.paid,
    });
    if (req.body?._id) {
        await Loan.updateOne({_id: req.body?._id}, {
            collateral_amount: req?.body?.collateral_amount
        })
    }
    console.log("loan_id", req.body?._id)
    return res.status(200).json({status: "Success", result: "Saved"}).end();
}
export const changePassword = async (req, res) => {
    try {
        let existing_user = await User.findOne({_id: req.params.id});
        const passwordCorrect = await bcrypt.compare(
            req.body.old_password,
            existing_user.password
        );
        if (passwordCorrect) {
            existing_user.password = bcrypt.hashSync(req.body.new_password, 2)
            existing_user.save();
            return res.status(200).json({status: "Success", result: "Password Changed"}).end();
        } else {
            return res.status(200).json({status: "Failure", result: "Invalid Password"}).end();
        }

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}
export const cancelLoan = async (req, res) => {
    await Loan.updateOne({_id:req.params.id},{
        approved:'Canceled',
    });
    return res.status(200).json({status:"Success", result:"Saved"}).end();
}
