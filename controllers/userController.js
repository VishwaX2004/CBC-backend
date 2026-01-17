import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../models/otpModel.js";
import dotenv from "dotenv";

dotenv.config();

/* =========================
   MAIL CONFIG
========================= */
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
            if (!user) {
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

            // ✅ JWT SHOULD ONLY CONTAIN IDENTITY DATA
            const token = jwt.sign(
                {
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                process.env.JWT_SECRET
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image
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
    return req.user && req.user.role === "admin";
}

export function isCustomer(req) {
    return req.user && req.user.role === "user";
}

/* =========================
   GET LOGGED USER (FIXED)
========================= */
export async function GetUsers(req, res) {
    if (!req.user?.email) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    try {
        const user = await User.findOne({ email: req.user.email }).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);

    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: err.message
        });
    }
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
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const googleUser = googleResponse.data;

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            user = new User({
                email: googleUser.email,
                firstName: googleUser.given_name,
                lastName: googleUser.family_name,
                password: bcrypt.hashSync("google-auth", 10),
                isEmailVerified: googleUser.email_verified,
                image: googleUser.picture
            });

            await user.save();
        }

        if (user.isBlock) {
            return res.status(403).json({
                message: "Your account has been blocked. Please contact support."
            });
        }

        const jwtToken = jwt.sign(
            {
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
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
        const users = await User.find().select("-password");
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
            message: "You cannot block yourself"
        });
    }

    try {
        await User.updateOne(
            { email: req.params.email },
            { isBlock: req.body.isBlock }
        );

        res.json({ message: "User status updated successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update user",
            error: err.message
        });
    }
}

/* =========================
   SEND OTP
========================= */
export async function SendOTP(req, res) {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await OTP.deleteMany({ email });
        await OTP.create({ email, otp });

        await transporter.sendMail({
            from: `"Crystal Beauty Clear" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP",
            html: `<h2>Your OTP is ${otp}</h2>`
        });

        res.json({ message: "OTP sent successfully" });

    } catch (err) {
        res.status(500).json({
            message: "Failed to send OTP",
            error: err.message
        });
    }
}

/* =========================
   CHANGE PASSWORD VIA OTP
========================= */
export async function ChangePasswordViaOTP(req, res) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        const record = await OTP.findOne({ email, otp });
        if (!record) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await User.updateOne(
            { email },
            { password: bcrypt.hashSync(newPassword, 10) }
        );

        await OTP.deleteMany({ email });

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        res.status(500).json({
            message: "Failed to change password",
            error: err.message
        });
    }
}

/* =========================
   UPDATE USER DATA
========================= */
export async function updateUserData(req, res) {
    if (!req.user?.email) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    try {
        await User.updateOne(
            { email: req.user.email },
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                image: req.body.image
            }
        );

        res.json({ message: "User data updated successfully" });

    } catch (err) {
        res.status(500).json({
            message: "Failed to update user",
            error: err.message
        });
    }
}

/* =========================
   CHANGE PASSWORD (LOGGED USER)
========================= */
export async function changePassword(req, res) {
    if (!req.user?.email) {
        return res.status(401).json({ message: "Unauthorized User" });
    }

    try {
        await User.updateOne(
            { email: req.user.email },
            { password: bcrypt.hashSync(req.body.password, 10) }
        );

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        res.status(500).json({
            message: "Failed to change password",
            error: err.message
        });
    }
}
