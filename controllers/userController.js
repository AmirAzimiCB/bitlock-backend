import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import Wallet from "../models/Wallet.js";
dotenv.config();

export const checkLogin = async(req, res) => {
  let user = await User.findOne({_id:req.user.id});
  return res.status(200).json({status:"Success", user}).end();
}

export const updatePersonalInfo = async (req, res) => {
  let gid= [];
  if(req.files){
    for(let i=0; i<req.files.length; i++){
      gid[i]=req.files[i].filename;
    }
  }
  try {
    if(gid.length>0){
      if(req.body?.old_images != undefined){
        gid.push(...req.body.old_images);
        console.log(gid);
      }
      let government_issued_identification = gid.join();
      await User.updateOne({ _id: req.params.id }, {
        government_issued_identification: government_issued_identification,
        ...req.body,
      });
    } else {
      if(req.body?.old_images != undefined){
        gid.push(...req.body.old_images);
      }
      let government_issued_identification = gid.join();
      await User.updateOne({ _id: req.params.id }, {
        government_issued_identification: government_issued_identification,
        ...req.body,
      });
    }
    let user = await User.findOne({ _id: req.params.id });
    return res.status(200).json({status:"Success", user:user}).end();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err).end();
  }
};

export const updateBankingInfo = async (req, res) => {
  try {
    await User.updateOne({ _id: req.params.id }, {...req.body});
    let user = await User.findOne({ _id: req.params.id });
    return res.status(200).json({status:"Success", user:user}).end();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err).end();
  }
};

export const applyLoan = async (req, res) => {
  console.log(req.body);
  try {
    let user = await User.findOne({ _id: req.params.id });
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
  let gid= [];
  if(req.files){
    for(let i=0; i<req.files.length; i++){
      gid[i]=req.files[i].filename;
    }
  }
  if(gid.length>0) {
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
  } else{
    let user = await User.findOne({_id: req.params.id});
    return res.status(200).json({status: "Success", user: user}).end();
  }
};

export const getMyLoans = async (req, res) => {
  let loans = await Loan.find({user:req.params.id});
  return res.status(200).json({status:"Success", loans}).end();
}

export const saveWallet = async (req, res) => {
  try {
    if(req.body?._id != undefined){
      await Wallet.updateOne({ _id: req.body._id }, {
        address:req.body.address,
        percentage:req.body.percentage,
      });
    } else {
      let user = await User.findOne({ _id: req.params.id });
      const wallet = new Wallet({
        ...req.body,
      });
      wallet.user = user;
      wallet.save();
      user.wallets.push(wallet._id)
      user.save();
    }
    return res.status(200).json({status:"Success", result:"Saved"}).end();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err).end();
  }
}

export const getMyWallets = async (req, res) => {
  let wallets = await Wallet.find({user:req.params.id});
  return res.status(200).json({status:"Success", wallets}).end();
}
