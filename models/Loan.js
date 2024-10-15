import mongoose from "mongoose";

const Loan = new mongoose.Schema(
  {
    borrow_amount: { type: String, required: true },
    currency_type: { type: String, required: true },
    collateral_amount: { type: String, required: true },
    ltv_start: { type: String, required: true },
    term_length: { type: String },
    loan_type: { type: String },
    category: { type: String },
    use_of_funds: { type: String },
    approved: { type: String, default: null },
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    wallet_group: { type: mongoose.Types.ObjectId, ref: "WalletGroup" },
    bank: { type: mongoose.Types.ObjectId, ref: "Bank" },
    payments: [{ type: mongoose.Types.ObjectId, ref: "LoanPayments" }],
    admin_wallet: { type: String, default: null },

    // Business-related fields
    company_name: { type: String, default: null },
    registered_address: { type: String, default: null },
    business_registration_number: { type: String, default: null },
    articles_of_incorporation: { type: String, default: null },
    directors_officers: { type: String, default: null },
    position_role: { type: String, default: null },
  },
  { timestamps: true }
);

const LoanSchema = mongoose.model("Loan", Loan);

export default LoanSchema;
