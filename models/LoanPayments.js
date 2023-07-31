import mongoose from 'mongoose'

const LoanPayments = new mongoose.Schema({
            billing_period: {type: String, required: true},
            payment_due: {type: String},
            date: {type: Date},
            remaining_principle: {type: String},
            loan: {type: mongoose.Types.ObjectId, ref: "Loan"},
    },
    {timestamps: true}
)

const LoanPaymentSchema = mongoose.model('LoanPayments', LoanPayments)

export default LoanPaymentSchema
