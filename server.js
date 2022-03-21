const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");
const ejs = require("ejs");


const app = express()
const port = 8000

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');



mongoose.connect("mongodb+srv://tanish:password%23123@cluster0.ouv6u.mongodb.net/ISAALABDA4?retryWrites=true&w=majority", {useNewUrlParser: true});


const User = mongoose.model("user", new mongoose.Schema({
    regno: String,
    password: String
}));


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
})
app.get('/addPage', (req, res) => {
    res.sendFile(__dirname + "/add.html");
})
app.get('/deletePage', (req, res) => {
    res.sendFile(__dirname + "/delete.html");
})
app.get('/modifyPage', (req, res) => {
    res.sendFile(__dirname + "/modify.html");
})




app.post('/add', async (req, res) => {
    var regno = req.body.regno;
    var password = req.body.password;
    
    //Password encryption
    password = CryptoJS.AES.encrypt(password, 'secret key 123').toString();


    const user = new User({
        regno: regno,
        password: password 
    });

    await user.save();
    res.render("success", {msg: "User added successfully!"});
})

app.post('/delete', async (req, res) => {
    var regno = req.body.regno;
    var password = req.body.password;

    User.findOne({ regno: regno }, async (err, user) => {
        
        if(user !== null){
            //decrypting password obtained from db
            var bytes  = CryptoJS.AES.decrypt(user.password, 'secret key 123');
            user.password = bytes.toString(CryptoJS.enc.Utf8);
        }

        if(user===null || password!=user.password){
            res.render("incorrect", {path: "/deletePage"});
        }else{
            await User.deleteOne({regno: regno});
            res.render("success", {msg: "User deleted successfully!"});
        }
    });

})

app.get('/view', async (req, res) => {

    User.find({}, async (err, users) => {
        users.forEach((user,i)=>{
            //decrypting password
            var bytes  = CryptoJS.AES.decrypt(user.password, 'secret key 123');
            users[i].decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        })
        res.render("view", {users: users});
    });

})

app.post('/modify', async (req, res) => {
    var currentRegno = req.body.currentRegno;
    var currentPassword = req.body.currentPassword;
    var newRegno = req.body.newRegno;
    var newPassword = req.body.newPassword;

    //encrypting new password
    newPassword = CryptoJS.AES.encrypt(newPassword, 'secret key 123').toString();
   

    User.findOne({ regno: currentRegno }, async (err, user) => {
        
        if(user !== null){
            //decrypting password obtained from db
            var bytes  = CryptoJS.AES.decrypt(user.password, 'secret key 123');
            user.password = bytes.toString(CryptoJS.enc.Utf8);
        }

        if(user===null || currentPassword!=user.password){
            res.render("incorrect", {path: "/modifyPage"});
        }else{
            await User.updateOne({ regno: currentRegno }, { regno: newRegno, password: newPassword });
            res.render("success", {msg: "Data modified successfully!"});
        }
    });

})



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})