import express from 'express'
import {assignWallet, getLoans, getUsers} from '../controllers/adminController.js'
import {verifyTokenAndAdmin} from "../utils/utils.js";

const router = express.Router()

router.use(verifyTokenAndAdmin);

router.route('/get_users').get(getUsers)
router.route('/get_loans').get(getLoans)
router.route('/assign_wallet').post(assignWallet)

export default router
