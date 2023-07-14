import mongoose from 'mongoose'

const deletedUserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String},
  email: { type: String, required: true, unique : true },
  password: { type: String, required: true },
  phone_number: { type: String, required: true, unique: true },
  dob: { type: String },
  occupation: { type: String },
  use_of_loan: { type: String },
  address_1: { type: String },
  address_2: { type: String },
  address_3: { type: String },
  country: { type: String },
  citizenship: { type: String },
  government_issued_identification: { type: String },
  bank_institution: { type: String },
  branch_number: { type: String },
  account_number: { type: String },
  branch_address: { type: String },
  main_account_currency: { type: String },
  account_name:{ type: String },
  isAdmin: { type: Boolean, default: false },
});

const DeletedUserSchema = mongoose.model('DeletedUser', deletedUserSchema)

export default DeletedUserSchema
