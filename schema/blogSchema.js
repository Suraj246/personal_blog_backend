import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
    {
        title: { type: String },
        category: { type: String },
        image: { type: String },
        content: { type: String },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comments' }]
    },
    {
        timestamps: true,
    }
);

const Blogs = mongoose.model("blogs", blogSchema);

export default Blogs
