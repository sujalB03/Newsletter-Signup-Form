const express = require("express");
require('dotenv').config();
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
const https =require("https");
// static --> Special function of express --> helps to load images or css on server which is saved on local system
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",function(req,res){
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req,res)=>{
    const firstName = req.body.fName;
    const lastName = req.body.lName;
    const emailId = req.body.emailAdd;

    const data = {
    members: [
        {
            email_address : emailId,
            status: "subscribed",
            merge_fields:{
                FNAME: firstName,
                LNAME: lastName
            }
        }
    ]

    };
    const jsonData = JSON.stringify(data);
    // console.log("Name: " + firstName +" " + lastName +" & Email Address: "+emailId);
    const url = "https://us21.api.mailchimp.com/3.0/lists/" + process.env.listId;
    const options ={
        method: "POST",
        auth: "sb:" + process.env.apikey   // anystring:apikey
    };
    const request = https.request(url, options,(response)=>{

        let chunks = "";
        response.on("data", (chunk)=> {
            chunks+=chunk;
        });
        response.on("end", function(){
            // Data is large that's why getting it into chunks
            const subsData = JSON.parse(chunks);
            const errorCount = subsData.error_count;
            
            if (response.statusCode === 200 & errorCount === 0){
                res.sendFile(__dirname + "/success.html");
            }
            else{
                res.sendFile(__dirname + "/failure.html");
            }
            
            console.log(process.env.apikey);
            console.log(subsData);
            console.log(subsData.error_count);  // No. of error(s) occur
            // console.log(response.statusCode);
        });
    
    })

    request.write(jsonData);
    request.end();
});

app.post("/failure",(req,res)=>{
    res.redirect("/");  //.redirect --> redirect to a path
});

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});
