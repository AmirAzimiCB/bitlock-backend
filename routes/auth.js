import express from 'express'
import {registerUser, loginUser, forgotPassword, checkEmailPhone, verifyOTP, resendOtp} from '../controllers/authController.js'

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/check_email_phone').post(checkEmailPhone)
router.route('/forgot-password').post(forgotPassword)
router.route('/verify-OTP').put(verifyOTP)
router.route("/resend_otp/:id").get(resendOtp)


export default router
