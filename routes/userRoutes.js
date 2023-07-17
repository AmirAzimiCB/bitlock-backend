import express from 'express'
import {uploadFile, verifyToken} from '../utils/utils.js'
import {
  updatePersonalInfo,
  updateBankingInfo,
  applyLoan,
  getMyLoans,
  uploadIdentityFiles,
  saveWallet,
  getMyWallets,
  checkLogin
} from '../controllers/userController.js'

const router = express.Router()

router.use(verifyToken);

router.route("/check_login").get(checkLogin)

router.route("/update_personal_info/:id").put(uploadFile.array("file[]"), updatePersonalInfo)
router.route("/update_banking_info/:id").put(updateBankingInfo)
router.route("/upload_identity_files/:id").put(uploadFile.array("id_files[]"), uploadIdentityFiles)

router.route("/apply_loan/:id").post(applyLoan)
router.route("/get_my_loans/:id").get(getMyLoans)

router.route("/save_wallet/:id").post(saveWallet)
router.route("/get_my_wallets/:id").get(getMyWallets)

export default router