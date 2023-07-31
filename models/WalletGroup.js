import mongoose from 'mongoose'

const WalletGroup = new mongoose.Schema({
        group_name: {type: String, required: true},
        wallets: [{type: mongoose.Types.ObjectId, ref: "Wallet"}],
        user: {type: mongoose.Types.ObjectId, ref: "User"},
    },
    {timestamps: true}
)

const WalletGroupSchema = mongoose.model('WalletGroup', WalletGroup)

export default WalletGroupSchema
