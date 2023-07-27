import User from "../models/User.js";
import * as dotenv from "dotenv";
import Loan from "../models/Loan.js";
import Wallet from "../models/Wallet.js";
import * as fs from "fs";
import AdminWallet from "../models/AdminWallet.js";
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
  if(req.body?.removed_images != undefined){
    req.body.removed_images.forEach((item)=>{
      fs.rmSync("uploads/"+item, {
        force: true,
      });
    });
  }
  try {
    if(gid.length>0){
      if(req.body?.old_images != undefined){
        gid.push(...req.body.old_images);
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
  let loans = await Loan.find({user:req.params.id, approved: 'Approved'}).populate('payments');
  return res.status(200).json({status:"Success", loans}).end();
}

export const getMyPendingLoans = async (req, res) => {
  let loans = await Loan.find({user:req.params.id, approved: null}).populate('payments');
  return res.status(200).json({status:"Success", loans}).end();
}

export const saveWallet = async (req, res) => {
  console.log("save+wallet calleed");
  try {
    await Wallet.deleteMany({user:req.params.id}).then(function(){
      console.log("Data deleted"); // Success
    }).catch(function(error){
      console.log(error); // Failure
    });
    let user = await User.findOne({ _id: req.params.id });
    user.wallets=[];
    for(let i=0; i<req.body.address.length;i++) {
      const wallet = new Wallet({
        address:req.body.address[i],
        percentage:req.body.percentage[i],
        user
      });
      wallet.save();
      user.wallets.push(wallet._id)
    }
    user.save();
    console.log("saved");
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

export const getAdminWallet = async (req, res) => {
  let wallet = await AdminWallet.findOne()
  return res.status(200).json({status:"Success", wallet}).end();
}
