const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");

const app = express()
const port = 8000

app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb+srv://tanish:password%23123@cluster0.ouv6u.mongodb.net/ISAALABDA4?retryWrites=true&w=majority", {useNewUrlParser: true});


const User = mongoose.model("user", new mongoose.Schema({
    regno: String,
    password: String
}));

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
    res.send("User added successfully!");
})

app.post('/delete', async (req, res) => {
    var regno = req.body.regno;
    var password = req.body.password;

    User.findOne({ regno: regno }, async (err, user) => {
        
        if(user != null){
            //decrypting password obtained from db
            var bytes  = CryptoJS.AES.decrypt(user.password, 'secret key 123');
            user.password = bytes.toString(CryptoJS.enc.Utf8);
        }

        if(user===null || password!=user.password){
            res.send("Regno or password incorrect!");
        }else{
            await User.deleteOne({regno: regno});
            res.send("User deleted successfully!");
        }
    });

})

app.get('/view', async (req, res) => {

    User.find({}, async (err, users) => {
        res.send(users);
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
        
        if(user != null){
            //decrypting password obtained from db
            var bytes  = CryptoJS.AES.decrypt(user.password, 'secret key 123');
            user.password = bytes.toString(CryptoJS.enc.Utf8);
        }

        if(user===null || currentPassword!=user.password){
            res.send("Regno or password incorrect!");
        }else{
            await User.updateOne({ regno: currentRegno }, { regno: newRegno, password: newPassword });
            res.send("Data successfully updated!")
        }
    });

})



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})