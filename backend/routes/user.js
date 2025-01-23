const express = require("express");
const { User } = require("../db");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");

const router = express.Router();

const signupBody = zod.object({
    username : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string(),

})

router.post("/signup" , async(req, res) => {
    const { success } = signupBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message : "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username : req.body.username
    });

    if(existingUser){
       return res.status(411).json({
        message : "Email already taken / Incorrect inputs"
       })
    }

    const user = await User.create({
        username : req.body.username,
        password : req.body.password,
        firstName : req.body.firstName,
        lastName : req.body.lastName
    })   
    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })
    
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message : "User created successfully",
        token : token
    })
});


const signinBody = zod.object({
    username : zod.string(),
    password : zod.string()
})

router.post("/signin" ,async (req , res) => {
    const { success } = signinBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username : req.body.username,
        password : req.body.password
    })

    if(user){
        const token = jwt.sign({
            userID : user._id
        }, JWT_SECRET)
        res.json({
            token : token
        })
        return;
    }

    res.status(411).json({
        message : "Error while logging in "
    })
})

const updatedBody = zod.object({
    password : zod.string().optional(),
    firstName : zod.string().optional(),
    lastName : zod.string().optional()
})

router.put("/user" , authMiddleware , async (req , res) => {
    const { success } = updatedBody.safeParse(req.body);

    if(!success){
        return res.status(411).json({
            message : "Error while updating information"
        })
    }

    await User.updateOne({_id : requserID} , req.body );

    res.json({
        message : "Updated successfully"
    })
})

router.get("/bulk" ,authMiddleware , async(req , res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user : user.map(user => ({
            username : user.username,
            firstname : user.firstName,
            lastName : user.lastName,
            _id : users._id
        }))
    })
})

module.exports = router;