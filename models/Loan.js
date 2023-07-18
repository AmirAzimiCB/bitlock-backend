import mongoose from 'mongoose'

const Loan = new mongoose.Schema({
        borrow_amount: {type: String, required: true},
        term_length: {type: String},
        loan_type: {type: String},
        category: {type: String},
        use_of_funds: {type: String},
        approved: {type: String, default: null},
        user: {type: mongoose.Types.ObjectId, ref: "User"},
        payments: [{type: mongoose.Types.ObjectId, ref: "LoanPayments"}],
    },
    {timestamps: true}
)

const LoanSchema = mongoose.model('Loan', Loan)

export default LoanSchema
