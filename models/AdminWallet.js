import mongoose from 'mongoose'

const Wallet = new mongoose.Schema({
        address: {type: String, required: true},
    },
    {timestamps: true}
)

const WalletSchema = mongoose.model('Wallet', Wallet)

export default WalletSchema
