const express = require('express')
const mongoose = require('mongoose')
const { User, Event } = require('./models')
const bodyParser = require('body-parser')
const cors = require('cors');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Mongo Connected")
})

const ImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    }
});

const Image = mongoose.model('Image', ImageSchema);

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', async (req, res) => {
    try {
        let user = await User.find({})
        return res.status(200).json({ user })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' })
    }
})

app.post('/new', async (req, res) => {
    try {
        let user1 = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        if (!user1) return res.status(401).json({ message: 'Unauthorised' });
        let salt = await bcryptjs.genSalt(10)
        let passwordEncrypted = await bcryptjs.hash(req.body.password, salt)
        let user = await User({ ...req.body, password: passwordEncrypted })
        await user.save()
        return res.status(200).json({ message: 'User created successfully', user })
    } catch (error) {
        console.log(error.message)
        let keyRepeated = 'Field'
        if (error.keyValue) {
            if (error.keyValue.username) keyRepeated = 'Username'
            else if (error.keyValue.email) keyRepeated = 'Email'
            console.log(keyRepeated)
            if (error.code == 11000) return res.status(403).json({ message: keyRepeated + ' already exists' })
        }
        if (error.message == 'jwt must be provided') return res.status(401).json({ message: 'Unauthorised' })
        return res.status(500).json({ message: 'Internal server error' })
    }
})

app.post('/api/login', async (req, res) => {
    console.log(req.body);
    if (req.method !== 'POST') {
        return res.status(402).json({ message: 'Invalid Method' });
    }
    try {
        console.log(req.body)
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        let passwordEncrypted = await bcryptjs.compare(password, user.password)
        console.log(passwordEncrypted)
        if (!passwordEncrypted) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, role: user.role });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/verify', async (req, res) => {
    console.log(req.body);
    if (req.method !== 'POST') {
        return res.status(402).json({ message: 'Invalid Method' });
    }
    try {
        const { token } = req.body;
        let v = jwt.verify(token, process.env.JWT_SECRET)
        let user = await User.findOne({ _id: v.userId })
        console.log(user)
        if (user._id)
            res.status(200).json({ message: "User validated successfully!", success: true, user: { username: user.username, name: user.name, email: user.email, role: user.role } });
        else
            res.status(401).json({ message: "User invalid!", success: false });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message, success: false });
    }
});

app.get('/test', async (req, res) => {
    console.log(req.headers.authorization)
    try {
        let user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        console.log(user)
        user = await User.findOne({ _id: user.userId })
        console.log(user)
        return res.json({ message: 'Success', user })
    } catch (error) {
        console.log(error.message)
        return res.json({ message: error.message })
    }
})

app.post('/api/upload', upload.single("image"), async (req, res) => {
    try {
        const buffer = req.file.buffer;
        console.log(buffer)
        const base64Image = buffer.toString("base64");
        const image = new Image({
            image: base64Image
        });
        await image.save();
        return res.status(200).send({ message: 'Image uploaded successfully' });
    } catch (error) {
        return res.status(500).send({ message: 'Failed to upload image' });
    }
});

app.get('/api/all', async (req, res) => {
    try {
        const images = await Image.find()
        return res.status(200).send({ message: 'Image uploaded successfully', images });
    } catch (error) {
        return res.status(500).send({ message: 'Failed to fetch images' });
    }
});

app.listen(5000)