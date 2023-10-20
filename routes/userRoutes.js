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
  checkLogin,
  getAdminWallet,
  getMyPendingLoans,
  savePaymentPaid,
  changePassword,
  deleteBank,
  deleteWallet,
  cancelLoan,
  send_email
} from '../controllers/userController.js'

const router = express.Router()

router.use(verifyToken);

router.route("/check_login").get(checkLogin)
router.route("/update_personal_info/:id").put(uploadFile.array("file[]"), updatePersonalInfo)
router.route("/update_banking_info/:id").put(updateBankingInfo)
router.route("/upload_identity_files/:id").put(uploadFile.array("id_files[]"), uploadIdentityFiles)
router.route("/apply_loan/:id").post(applyLoan)
router.route("/get_my_loans/:id").get(getMyLoans)
router.route("/get_my_pending_loans/:id").get(getMyPendingLoans)
router.route("/save_wallet/:id").post(saveWallet)
router.route("/get_my_wallets/:id").get(getMyWallets)
router.route("/get_admin_wallet/").get(getAdminWallet)
router.route("/save_payment_paid/:id").post(savePaymentPaid)
router.route("/change_password/:id").post(changePassword)
router.route("/delete_bank/:id").post(deleteBank)
router.route("/delete_wallet/:id").post(deleteWallet)
router.route('/cancel_loan/').post(cancelLoan)
router.route("/send_email/").get(send_email)

export default router
