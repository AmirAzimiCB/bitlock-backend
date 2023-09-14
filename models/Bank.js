import mongoose from 'mongoose'

const Bank = new mongoose.Schema({
        bank_institution: {type: String},
        branch_number: {type: String},
        account_number: {type: String},
        branch_address: {type: String},
        main_account_currency: {type: String},
        account_name: {type: String},
        status: {type: Number, default: 1},
    },
    {timestamps: true}
)

const BankSchema = mongoose.model('Bank', Bank)

export default BankSchema

