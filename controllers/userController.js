import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD
    }
});

/* =========================
   CREATE USER
========================= */
export function createUser(req, res) {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword
    });

    user.save()
        .then(() => {
            res.json({ message: "User created successfully" });
        })
        .catch(() => {
            res.status(500).json({ message: "Failed to create user" });
        });
}

/* =========================
   LOGIN USER
========================= */
export function loginUser(req, res) {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user == null) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.isBlock) {
                return res.status(403).json({
                    message: "Your account has been blocked. Please contact support."
                });
            }

            const isPasswordMatching = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!isPasswordMatching) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image
                },
                process.env.JWT_SECRET
            );

            res.json({
                message: "Login successful",
                token: token,
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                }
            });
        })
        .catch(() => {
            res.status(500).json({ message: "Login failed" });
        });
}

/* =========================
   ROLE CHECKS
========================= */
export function isAdmin(req) {
    if (req.user == null) return false;
    if (req.user.role !== "admin") return false;
    return true;
}

export function isCustomer(req) {
    if (req.user == null) return false;
    if (req.user.role !== "user") return false;
    return true;
}

/* =========================
   GET LOGGED USER
========================= */
export function GetUsers(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Unauthorized User" });
    }
    res.json(req.user);
}

/* =========================
   GOOGLE LOGIN
========================= */
export async function GoogLogin(req, res) {
    const token = req.body.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    try {
        const googleResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        const googleUser = googleResponse.data;

        let user = await User.findOne({ email: googleUser.email });

        if (user == null) {
            user = new User({
                email: googleUser.email,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                password: "abc1234",
                isEmailVerified: googleUser.email_verified,
                image: googleUser.picture
            });

            user = await user.save();
        }

        if (user.isBlock) {
            return res.status(403).json({
                message: "Your account has been blocked. Please contact support."
            });
        }

        const jwtToken = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            },
            process.env.JWT_SECRET
        );

        res.json({
            message: "Google Login Successful",
            token: jwtToken,
            user: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Google Login Failed",
            error: error.message
        });
    }
}

/* =========================
   ADMIN: GET ALL USERS
========================= */
export async function GetallUsers(req, res) {
    if (!isAdmin(req)) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: err.message
        });
    }
}

/* =========================
   ADMIN: BLOCK / UNBLOCK
========================= */
export async function BlockOrUnblockUser(req, res) {
    if (!isAdmin(req)) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    if (req.params.email === req.user.email) {
        return res.status(400).json({
            message: "You Cannot Block Yourself"
        });
    }

    try {
        await User.updateOne(
            { email: req.params.email },
            { isBlock: req.body.isBlock }
        );

        res.json({
            message: "User status updated successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to Block/Unblock User",
            error: err.message
        });
    }
}


export async function SendOTP(req, res) {
    const email = req.params.email;

    if (email == null) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await OTP.deleteMany({ email });

        const newOTP = new OTP({ email, otp });
        await newOTP.save();

        await transporter.sendMail({
            from: `"Crystal Beauty Clear" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your One-Time Password (OTP)",
            html: `
    <div style="
        background-color:#F6F1E9;
        padding:40px 0;
        font-family: 'Segoe UI', Arial, sans-serif;
        color:#333446;
    ">
        <div style="
            max-width:520px;
            margin:0 auto;
            background:#ffffff;
            border-radius:16px;
            box-shadow:0 10px 30px rgba(0,0,0,0.08);
            overflow:hidden;
        ">

            <!-- Header -->
            <div style="
                background:linear-gradient(135deg, #FF9A00, #FFD93D);
                padding:24px;
                text-align:center;
                color:#ffffff;
            ">
                <h1 style="
                    margin:0;
                    font-size:24px;
                    font-weight:600;
                ">
                    Password Reset
                </h1>
            </div>

            <!-- Body -->
            <div style="padding:32px;">
                <p style="
                    font-size:15px;
                    line-height:1.6;
                    margin-bottom:20px;
                ">
                    Hello,
                </p>

                <p style="
                    font-size:15px;
                    line-height:1.6;
                    margin-bottom:24px;
                ">
                    We received a request to reset your password.  
                    Please use the following One-Time Password (OTP) to continue:
                </p>

                <!-- OTP Box -->
                <div style="
                    background:#F6F1E9;
                    border:2px dashed #FF9A00;
                    border-radius:12px;
                    padding:16px;
                    text-align:center;
                    margin-bottom:24px;
                ">
                    <span style="
                        font-size:28px;
                        font-weight:700;
                        letter-spacing:6px;
                        color:#333446;
                    ">
                        ${otp}
                    </span>
                </div>

                <p style="
                    font-size:14px;
                    color:#555;
                    margin-bottom:20px;
                ">
                    ⏳ This OTP is valid for <strong>5 minutes</strong>.  
                    Please do not share it with anyone.
                </p>

                <p style="
                    font-size:14px;
                    color:#777;
                    margin-bottom:0;
                ">
                    If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="
                background:#F6F1E9;
                padding:16px;
                text-align:center;
                font-size:12px;
                color:#777;
            ">
                © ${new Date().getFullYear()} Crystal Beauty Clear. All rights reserved.
            </div>

        </div>
    </div>
    `
        });

        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to send OTP",
            error: err.message
        });
    }
}


export async function ChangePasswordViaOTP(req, res) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const otpRecord = await OTP.findOne({
            email: email.trim(),
            otp: otp.trim()
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        const result = await User.updateOne(
            { email: email.trim() },
            { password: hashedPassword }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        await OTP.deleteMany({ email });

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        res.status(500).json({
            message: "Failed to change password",
            error: err.message
        });
    }
}

