import mongoose from 'mongoose'

const Wallet = new mongoose.Schema({
        address: {type: String, required: true},
        percentage: {type: String},
        user: {type: mongoose.Types.ObjectId, ref: "User"},
    },
    {timestamps: true}
)

const WalletSchema = mongoose.model('Wallet', Wallet)

export default WalletSchema
