import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import Wallet from "../models/Wallet.js";
import * as fs from "fs";
import AdminWallet from "../models/AdminWallet.js";
import WalletGroup from "../models/WalletGroup.js";
import Bank from "../models/Bank.js";
import {getUser, sendAdminEmail, sendEmail} from "../utils/utils.js";
import LoanPayments from "../models/LoanPayments.js";
import bcrypt from "bcrypt";
import speakeasy, {generateSecret} from "speakeasy";

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
            await bank.save();
            user.banks.push(bank._id);
            await user.save();
        }
        user = await getUser(user._id);
        return res.status(200).json({status: "Success", result: "Saved", user}).end();
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
        sendAdminEmail(user, req.body, 'loan_notification.ejs', 'New loan has applied on BitLoc')
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
            sendEmail(req?.body?.email, req?.body, 'wallet_address_change.ejs', 'Bitcoin Wallet Address Change - Important Update')
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
        await walletGroup.save();
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


export const deleteBank = async (req, res) => {
    try {
        console.log("bank_id", req.params.id)
        const loansCount = await Loan.countDocuments({bank: req.params.id});
        if (loansCount > 0) {
            // Loans exist, update banking status
            await Bank.findOneAndUpdate({_id: req.params.id}, {status: 0});
        } else {
            // No loans, delete banking information
            await Bank.findByIdAndDelete({_id: req.params.id});
        }
        let user = await getUser(req.body._id);
        return res.status(200).json({status: "Success", user}).end();
    } catch (error) {
        console.error('Error:', error);
    }
}

export const deleteWallet = async (req, res) => {
    try {
        const loansCount = await Loan.countDocuments({wallet_group: req.params.id});
        let user;
        if (loansCount > 0) {
            // Loans exist, update banking status
            await WalletGroup.findOneAndUpdate({_id: req.params.id}, {status: 0});
            user = await getUser(req.body._id);
        } else {
            // No loans, delete banking information
            await WalletGroup.findByIdAndDelete({_id: req.params.id});
            user = await getUser(req.body._id);
        }
        return res.status(200).json({status: "Success", user}).end();
    } catch (error) {
        console.error('Error:', error);
    }
}
export const cancelLoan = async (req, res) => {
    await Loan.updateOne({_id: req?.body?.id}, {
        approved: req?.body?.pay_type,
    });
    return res.status(200).json({status: "Success", result: "Saved"}).end();
}

export const send_email = () => {
    return res.status(200).json({status: "Success", result: "Saved"}).end();
}

export const get_2fa_secret = async (req, res) => {
    let user = await getUser(req.params.id);
    let secret = speakeasy.generateSecret({
        name:"Bitloc 2FA",
    })
    await User.updateOne({_id: req.params.id}, {
        auth2FaSecret: secret.hex,
    });
    return res.status(200).json({status: "Success", result: "Verify Secret", "secret":secret}).end();
}
export const verify_2fa_code = async (req, res) => {
    let user = await getUser(req.body.id);
    let verified = speakeasy.totp.verify({
        secret:user.auth2FaSecret,
        encoding:'hex',
        token: req.body.code,
    })
    if(verified){
        await User.updateOne({_id: req.body.id}, {
            auth2FaEnabled: true,
        });
        return res.status(200).json({status: "Success", result: "2 Factor Authentication Enabled"}).end();
    } else {
        return res.status(200).json({status: "failure", result: "Unable to verify"}).end();
    }
}

export const disable_2fa = async (req, res) => {
    let user = await getUser(req.body.id);
    let verified = speakeasy.totp.verify({
        secret:user.auth2FaSecret,
        encoding:'hex',
        token: req.body.code,
    })
    if(verified){
        await User.updateOne({_id: req.body.id}, {
            auth2FaEnabled: false,
            auth2FaSecret: "",
        });
        return res.status(200).json({status: "Success", result: "2 Factor Authentication Disabled"}).end();
    } else {
        return res.status(200).json({status: "failure", result: "Unable to verify"}).end();
    }
}
