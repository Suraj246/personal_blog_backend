import dotenv from "dotenv";
import express from 'express'
import colors from 'colors'
const port = process.env.PORT || 4000
import mongoose from 'mongoose'
import newUser from './schema/userSchema.js'
import Blogs from './schema/blogSchema.js'
import Comments from './schema/commentSchema.js'
import cors from 'cors'
import jwt from "jsonwebtoken";
import multer from "multer";
import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";


// Multer middleware for image uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, '/uploads')
//     },
//     filename: function (req, file, cb) {
//         // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.originalname)
//     }
// })

// const upload = multer({ storage: storage })
// const upload = multer({ dest: "uploads/" })

dotenv.config({ path: "./config.env" });

const app = express()
app.use('/uploads', express.static('uploads'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
mongoose.set('strictQuery', true);

mongoose.connect(process.env.DATABASE)
    .then((res) => console.log('> Database Connected...'.bgCyan))
    .catch(err => console.log(`> Error while connecting to mongoDB : ${err.message}`.underline.bgRed))

// you will get this error if you remove following code 
// => Unhandled Rejection: Cast to ObjectId failed for value "favicon.ico" (type string) at path "_id" for model "blogs"
// Middleware to handle favicon.ico requests
app.use((req, res, next) => {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({ nope: true });
    } else {
        next();
    }
});

app.use("/user", userRouter)
app.use("/user/blog", blogRouter)

// app.get('/comments', async (req, res) => {
//     try {
//         // const result = await newUser.find({})
//         const result = await Comments.find({})
//         // const result = await newUser.findByIdAndDelete({ blogs: new mongoose.Types.ObjectId("642d191e569169eb7c5bbe55") }).populate('blogs')
//         if (result) {
//             return res.status(200).json(result)
//         }
//         else {
//             return res.status(400).json({ message: "failed to fetch data" })
//         }
//     }
//     catch {
//         res.status(500).json({ message: "server error" })
//     }
// })

// creating comments 

app.post('/create-comment', async (req, res) => {
    const title = req.body.title
    try {
        if (!title) {
            return res.status(403).json({ message: "post field is empty" })
        }
        const create_new_post = new Comments({ title });
        const newPost = await create_new_post.save();
        if (newPost) {
            return res.status(201).json({ success: "new comment successfully created", newPost });
        }
        else {
            return res.status(404).json({ success: "failed to create comment" });
        }
    } catch (error) {
        res.status(500).json({ error: error })
    }
    res.send('hello from simple server :)')

})

// storing comments to current blog
app.post('/store-comment-to-each-blog', async (req, res) => {
    try {
        const product = await Blogs.updateOne({ _id: req.body.blogId }, { $addToSet: { comments: req.body.commentId } });

        if (product) {
            res.status(200).send("blog successfully added");
        } else {
            res.status(404).send({ message: "blog id not found" });
        }
    } catch (error) {
        res.status(500).send({ message: "server error", error });
    }
})

// get all blogs
app.get('/', async (req, res) => {
    try {
        const result = await newUser.find().populate('blogs');
        return res.status(200).json(result);
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// single blog details 
app.get("/:id", async (req, res) => {
    const product = await Blogs.findOne({ _id: req.params.id }).populate("comments");
    try {
        if (product) {
            res.send(product);
        } else {
            res.status(404).send({ message: "Product not found" });
        }
    }
    catch {
        res.status(500).json({ message: "server error" })
    }
});










//admin update post // not in use ignore this
// app.put('/admin/update/:id/:blog_id', async (req, res) => {
//     const { id, blog_id } = req.params
//     const { title, image, content } = req.body
//     console.log(req.body)
//     console.log(req)
//     try {
//         // const admin = await adminUser.findOne({ _id: id })
//         // if (admin.type === "admin") {
//         //     await Blogs.findByIdAndUpdate({ _id: blog_id }, { title: title, image: image, content: content }, { new: true })

//         //         .then((result) => {
//         //             res.status(200).json(result)
//         //         })
//         //         .catch((error) => {
//         //             res.status(499).json(error)
//         //         })
//         // }
//     } catch (error) {
//         res.status(500).json({ error: error })
//     }
// })

// admin delete post //not in use
// app.delete('/admin/:admin_id/:id/:product_index', async (req, res) => {
//     const { admin_id, id, product_index } = req.params
//     console.log(req.params)

//     try {
//         const admin = await adminUser.findOne({ _id: admin_id })
//         if (admin.type === "admin") {
//             newUser.findOne({ _id: new mongoose.Types.ObjectId(id) })
//                 .then((result) => {
//                     const book = result.blogs[product_index]
//                     newUser.findOneAndUpdate(
//                         { _id: new mongoose.Types.ObjectId(id) },
//                         {
//                             $pull: {
//                                 blogs: book
//                             }
//                         },
//                         { new: true }
//                     )
//                         .then((result) => {
//                             // console.log("document", result)
//                             res.status(200).json({ message: "user", result }).end();
//                         })
//                     // console.log("success", result)
//                 })
//         }
//         else {
//             res.status(404).json({ message: "your are not admin" })
//         }
//     }
//     catch {
//         res.status(500).json({ message: "server error" })
//     }

// })

app.listen(port, () => console.log(`> Server is up and running on port : http://localhost:${port}`.underline.bgMagenta))





// How It Works:
// Catches Unhandled Rejections: Any unhandled promise rejections will be captured here.

// Logs the Error: We log the error message to make debugging easier.

// Exits the Process: By calling process.exit(1), we ensure the application doesn’t continue running in an unstable state after a critical failure.
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error.message);
    process.exit(1);
});