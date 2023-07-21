import express from 'express'
import {registerUser, loginUser, forgotPassword, checkEmailPhone, verifyOTP} from '../controllers/authController.js'
import {verifyToken} from "../utils/utils.js";

const router = express.Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/check_email_phone').post(checkEmailPhone)
router.route('/forgot-password').post(forgotPassword)
router.route('/verify-OTP').put(verifyOTP)

export default router
