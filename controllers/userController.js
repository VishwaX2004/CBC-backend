import axios from "axios";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export function loginUser(req, res) {
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user == null) {
                return res.status(404).json({ message: "User not found" });
            } else {

                if (user.isBlock) {
                    res.status(403).json(
                        {
                            message: "Your account has been blocked. Please contact support."
                        }
                    )
                    return;
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
            }
        })

        .catch(() => {
            res.status(500).json({ message: "Login failed" });
        });
}

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

export function GetUsers(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Unauthorized User" });
    }
    res.json(req.user);
}

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
        } else {

            if (user.isBlock) {
                res.status(403).json(
                    {
                        message: "Your account has been blocked. Please contact support."
                    }
                )
                return;
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
            })
        };
    } catch (error) {
        res.status(500).json({
            message: "Google Login Failed",
            error: error.message
        });
    }
}

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


 