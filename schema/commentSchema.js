import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema(
    {
        title: { type: String },
    },
    {
        timestamps: true,
    }
);
const Comments = mongoose.model("comments", commentSchema);

export default Comments
