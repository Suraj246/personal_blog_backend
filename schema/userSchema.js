import mongoose from 'mongoose'
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        username: { type: 'string', },
        email: { type: "string" },
        password: { type: "string" },
        type: { type: "string" },
        blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'blogs' }],
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
    }
)

userSchema.methods.generateAuthToken = async function () {
    try {
        // console.log(this._id);
        let token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        // console.log(token)
        return token;
    } catch (err) {
        console.log(err);
    }
};

const newUser = mongoose.model("User", userSchema)

export default newUser
