import express from 'express'
import newUser from '../schema/userSchema.js';
const userRouter = express.Router()


// user signup
userRouter.post("/signup", async (req, res) => {
    const { username, email, password } = req.body
    try {
        const userExit = await newUser.findOne({ email: email });

        if (userExit) {
            return res.status(409).json({ message: "user already exits" });
        }
        if (!username || !email || !password) {
            return res.status(403).json({ message: "user field is empty" })
        }
        const user = new newUser({ username, email, password, type: "user" });
        const new_created_User = await user.save();
        if (new_created_User) {
            return res.status(201).json({ success: "user successfully created" });
        }
    } catch (err) {
        return res.status(422).json({ message: "error" });
    }
})
//user login
userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(403).json({ message: "user field is empty" })
    }
    try {
        const userAvailable = await newUser.findOne({
            email: email,
            password: password,
        });
        if (userAvailable) {
            if (
                password === userAvailable.password &&
                email === userAvailable.email
            ) {
                const token = await userAvailable.generateAuthToken();

                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 2592000000),
                    httpOnly: true,
                });

                res.status(200).json({
                    message: "login successful",
                    token,
                    userId: userAvailable._id,
                    username: userAvailable.username,
                    email: userAvailable.email,
                });
            } else {
                res.status(401).json({ message: "email or password incorrect" });
            }
        }

        else {
            res.status(404).json({ message: "user not found" });
        }
    } catch (err) {
        res.send({ message: err });
    }
});

// get user
userRouter.post('/get-data', async (req, res) => {
    const userId = req.body.userId
    try {
        const data = await newUser.findOne({ _id: userId }).populate("blogs")
        if (data) {
            res.status(201).send({ message: "get product successful", data: data });
        } else {
            res.status(404).send({ message: "Product failed" });
        }
    } catch (error) {
        res.status(500).send({ message: "server error", error });
    }
})
export default userRouter