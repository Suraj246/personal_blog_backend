import express from 'express'
import Blogs from '../schema/blogSchema.js'
const blogRouter = express.Router()
import multer from "multer";
import newUser from '../schema/userSchema.js';
import mongoose from 'mongoose';
const upload = multer({ dest: "uploads/" })

blogRouter.post('/create-post', upload.single("image"), async (req, res) => {
    // const { title, image, content } = req.body
    const title = req.body.title
    const image = req.file ? req.file.filename : 'no image'
    const content = req.body.content
    const category = req.body.category


    try {
        if (!title || !content) {
            return res.status(403).json({ message: "post field is empty" })
        }
        const create_new_post = new Blogs({ title, image, content, category });
        const newPost = await create_new_post.save();
        if (newPost) {
            return res.status(201).json({ success: "new post successfully created", newPost });
        }
        else {
            return res.status(404).json({ success: "failed to create post" });
        }
    } catch (error) {
        res.status(500).json({ error: error })
    }
})

blogRouter.post('/store-post-to-each-user', async (req, res) => {
    try {
        const product = await newUser.updateOne({ _id: req.body.userId }, { $addToSet: { blogs: req.body.blogId } });

        if (product) {
            res.status(200).send("blog successfully added");
        } else {
            res.status(404).send({ message: "blog id not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "server error", error });
    }
})

//user delete post
blogRouter.delete('/:id/:product_index', async (req, res) => {
    const { id, product_index } = req.params

    // console.log(req.params)
    newUser.findOne({ _id: new mongoose.Types.ObjectId(id) })
        .then((result) => {
            const book = result.blogs[product_index]
            newUser.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) },
                {
                    $pull: {
                        blogs: book
                    }
                },
                { new: true }
            )
                .then((result) => {
                    // console.log("document", result)
                    res.status(200).send({ message: "user", result }).end();
                })
            // console.log("success", result)
        })
})

// user update post
// blogRouter.put('/update/:id', upload.single("image"), async (req, res) => {
blogRouter.put('/update/:id', async (req, res) => {
    const { id } = req.params
    // const { title, image, content } = req.body
    const title = req.body.title
    // const image = req.file ? req.file.filename : null
    const content = req.body.value
    try {
        await Blogs.findByIdAndUpdate({ _id: id }, { title: title, content: content }, { new: true })
            .then((result) => {
                res.status(200).json(result)
            })
            .catch((error) => {
                res.status(499).json(error)
            })

    } catch (error) {
        res.status(500).json({ error: error })
    }

})

export default blogRouter