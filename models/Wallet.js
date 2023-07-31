import mongoose from 'mongoose'

const Wallet = new mongoose.Schema({
        address: {type: String, required: true},
        percentage: {type: String},
        wallet_group: {type: mongoose.Types.ObjectId, ref: "WalletGroup"},
    },
    {timestamps: true}
)

const WalletSchema = mongoose.model('Wallet', Wallet)

export default WalletSchema
