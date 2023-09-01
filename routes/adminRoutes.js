import express from 'express'
import {
    getLoans,
    getUsers,
    getWallet,
    saveLoanApproval,
    saveLoanPayments,
    approveUser, assignWallet, savePaymentNotes, savePaymentCheck, deleteUser, updatePersonalInfo, deleteLoan
} from '../controllers/adminController.js'
import {verifyTokenAndAdmin} from "../utils/utils.js";

const router = express.Router()

router.use(verifyTokenAndAdmin);

router.route('/get_users').get(getUsers)
router.route('/get_loans').get(getLoans)
router.route('/assign_wallet/:id').post(assignWallet)
router.route('/get_wallet').get(getWallet)
router.route('/save_loan_payments/:id').post(saveLoanPayments)
router.route('/save_loan_approval/:id').post(saveLoanApproval)
router.route('/approve_user/:id').post(approveUser)
router.route('/save_payment_check/:id').post(savePaymentCheck)
router.route('/save_payment_notes/:id').post(savePaymentNotes)
router.route('/delete_user').post(deleteUser)
router.route('/delete_loan').post(deleteLoan)
router.route('/update_personal_info/:id').post(updatePersonalInfo)

export default router
