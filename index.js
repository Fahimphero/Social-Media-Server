const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gwfjf6s.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     console.log('Mongodb Connected')
//     // perform actions on the collection object
//     client.close();
// });


async function run() {

    try {
        await client.connect();
        const postCollection = client.db('socialMedia').collection('posts');

        app.get('/posts', async (req, res) => {

            const query = {};
            const cursor = postCollection.find(query);
            const posts = await cursor.toArray();
            res.send(posts);

        });


        app.get('/posts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const post = await postCollection.findOne(query);
            res.send(post);

        });


        // Post Api
        app.post('/posts', async (req, res) => {
            const newPost = req.body;
            const result = await postCollection.insertOne(newPost);
            res.send(result);
        })


        app.put('/posts/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            console.log(update)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    likes: update.totalLikes,
                    email: update.email,
                    like: update.liked

                }
            };
            const result = await postCollection.updateOne(filter, updatedDoc, options);
            res.send(result);


        });



        // comments post
        app.post("/comments/:id", async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            // console.log(update)
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $push: {
                    comments: update.comments
                }
            }
            const result = await postCollection.updateOne(filter, updatedDoc)
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Social Media Server')
})
app.listen(port, () => {
    console.log('Listening to port', port)
})

