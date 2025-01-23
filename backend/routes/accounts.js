const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db.js");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
})



router.post("/transfer", authMiddleware, async (req, res) => {
    const session = mongoose.startSession();

    session.startSession();

    const { to, amount } = req.body;

    const account = await Account.findOne({
        userId: req.userId
    }).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        })
    }

    const toAccount = await Account.findOne({
        userId: to
    }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        })
    }

    await Account.updateOne(
        { userId: req.userID },
        { $inc: { balance: -amount } }).session(session);

    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    })


})


module.exports = router;