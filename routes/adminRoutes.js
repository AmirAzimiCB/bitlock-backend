import express from 'express'
import {getLoans, getUsers, getWallet, saveLoanPayments, saveWallet} from '../controllers/adminController.js'
import {verifyTokenAndAdmin} from "../utils/utils.js";

const router = express.Router()

router.use(verifyTokenAndAdmin);

router.route('/get_users').get(getUsers)
router.route('/get_loans').get(getLoans)
router.route('/save_wallet').post(saveWallet)
router.route('/get_wallet').get(getWallet)

router.route('/save_loan_payments/:id').post(saveLoanPayments)

export default router
