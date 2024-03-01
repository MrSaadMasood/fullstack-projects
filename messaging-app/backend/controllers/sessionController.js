const bcrypt = require("bcrypt");
const { connectData, getData } = require("../connection");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/utils");
const { MongoClient } = require("mongodb");
const { dataBaseConnectionMaker } = require("./controllerHelpers");
require("dotenv").config();

let database;
const mongoUrl = process.env.MONGO_URL

connectData((err) => {
    if (!err) {
        database = getData();
    }
});

// based on the validation result the password is hased and the user data is stored in the database
exports.createUser = async (req, res) => {
    const result = validationResult(req);
    const { fullName, email, password } = req.body;
    if (result.isEmpty()) {
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) return res.status(400).json({ error: "the user could not be created" });
            try {
                const user = await database.collection("users").insertOne({
                    fullName: fullName,
                    email: email,
                    password: hashedPassword,
                    friends: [],
                    receivedRequests: [],
                    sentRequests: [],
                });

                if (!user) throw new Error;
                return res.json({ message: "user successfully created" });
            } catch (error) {
                res.status(400).json({ error: "input validation failed" });
            }
        });
    } else {
        res.status(400).json({ error: "the user could not be created" });
    }
};

// based on the validation result the user is verified and the specific information is projected and sent back
exports.loginUser = async (req, res) => {
    const result = validationResult(req);
    const { email, password } = req.body;
    if (result.isEmpty()) {
        try {
            const user = await database.collection("users").findOne(
                { email: email },
                {
                    projection: {
                        fullName: 1,
                        friends: 1,
                        sentRequests: 1,
                        receivedRequests: 1,
                        password: 1,
                    },
                }
            );

            if (!user) throw new Error;
            
            const match = await bcrypt.compare(password, user.password);

            if (!match) return res.status(404).json({ message: "user not found" });

            const accessToken = generateAccessToken({ id: user._id });

            if (!accessToken) return res.status(412).json({ error: "cannot log in the user" });

            const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET);

            if (!refreshToken) return res.status(412).json({ error: "cannot log in the user" });

            try {
                const tokenStore = await database.collection("tokens").insertOne({ token: refreshToken });
                res.json({ accessToken, refreshToken, userData: user });
            } catch (error) {
                res.status(404).json({ error: "login failed" });
            }
        } catch (error) {
            res.status(404).json({ error: "user not found" });
        }
    }
};

// on token expiration the request is sent from the front end to and the access token is refreshed if the refresh token
// is present in the database of the user
exports.refreshUser = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const tokenCheck = await database.collection("tokens").findOne({ token: refreshToken });

        if (!tokenCheck) return res.status(399).json({ error: "cannot refresh the token" });

        jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, data) => {
            if (err) return res.sendStatus(399);

            const newAccessToken = generateAccessToken({ id: data.id });

            if (!newAccessToken) return res.sendStatus(399);

            res.json({ newAccessToken });
        });
    } catch (error) {
        res.status(399).json({ error: "cannot refresh the token" });
    }
};

// on logout the refreshed token is removed from the daatabase
exports.logoutUser = async (req, res) => {
    const { user } = req.params;

    try {
        const deleteToken = await database.collection("tokens").deleteOne({ token: user });

        if (deleteToken.deletedCount > 0) {
            res.json({ message: "user successfully logged out" });
        } else {
            throw new Error;
        }
    } catch (error) {
        res.status(400).json({ error: "logout failed" });
    }
};
