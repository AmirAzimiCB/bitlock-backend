import mongoose from 'mongoose'

const User = new mongoose.Schema({
        first_name: {type: String, required: true},
        last_name: {type: String},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        phone_number: {type: String, required: true, unique: true},
        dob: {type: String},
        otp: {type: String},
        is_verified: {type: Boolean, default: false},
        occupation: {type: String},
        use_of_loan: {type: String},
        address_1: {type: String},
        address_2: {type: String},
        address_3: {type: String},
        state: {type: String},
        country: {type: String},
        citizenship: {type: String},
        govt_identity_type: {type: String},
        government_issued_identification: {type: String},
        identity_files: {type: String},
        bank_institution: {type: String},
        branch_number: {type: String},
        account_number: {type: String},
        branch_address: {type: String},
        main_account_currency: {type: String},
        account_name: {type: String},
        isAdmin: {type: Boolean, default: false},
        assigned_wallet: {type: String},
        loans: [{type: mongoose.Types.ObjectId, ref: "Loan"}],
        wallets: [{type: mongoose.Types.ObjectId, ref: "Wallet"}],
        wallet_groups: [{type: mongoose.Types.ObjectId, ref: "WalletGroup"}],
        banks: [{type: mongoose.Types.ObjectId, ref: "Bank"}],
        approved: {type: Boolean, default: false},
    },
    {timestamps: true}
)

const UserSchema = mongoose.model('User', User)

export default UserSchema
