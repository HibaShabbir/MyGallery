//Server.js
var express=require('express');
var bodyParser=require("body-parser");
var nodemailer = require('nodemailer');
var app=express();
app.use(bodyParser.urlencoded({extended:true}));

var transporter = nodemailer.createTransport({
    port: 465,
    host:"smtp.gmail.com",
    auth: {
        user: 'rabiashakil786@gmail.com',
        pass: 'vzehenfkizkhpnrj',
    },
    secure: true,
});
app.post('/submit' , function(req,res){
    var name = req.body.email;
    var sub =req.body.subject;
    var txt=req.body.text;
    var mailOptiopns ={
        from: 'rabiashakil786@gmail.com',
        to :name,
        subject:sub,
        text :txt
    };
    transporter.sendMail(mailOptiopns,function(error,info){
        if(error)
            console.log('error');
        else
            console.log('Email sent' + info.response)
    });
})

app.get('/',function(req,res){
    res.sendFile(__dirname+'/Q1.html');
    
});
app.listen(3000,function(){
    console.log('running...');
});