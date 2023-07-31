import mongoose from 'mongoose'

const AdminWallet = new mongoose.Schema({
        address: {type: String, required: true},
    },
    {timestamps: true}
)

const AdminWalletSchema = mongoose.model('AdminWallet', AdminWallet)

export default AdminWalletSchema
