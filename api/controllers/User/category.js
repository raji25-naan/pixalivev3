const Category = require("../../models/User/category");
const nodemailer = require("nodemailer");

exports.createCategory = async (req, res, next) => {

        // let category = req.body;
        let totalCategory = [{category: "Animals",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FAnimals.svg?alt=media&token=ddc97c8c-d9db-4b6b-b2a2-fb3674fdd87b"},
                             {category: "Arts & Crafts",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FArts%20%26%20Crafts.svg?alt=media&token=4b7c93cd-10a3-4f68-b389-23f8b383df4e"},
                             {category: "Automobiles",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FAutomobiles.svg?alt=media&token=5e4e9e96-c6b1-44c3-9c1d-ace7b77a27c9"},
                             {category: "Cars",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2Fcars.svg?alt=media&token=1c584852-b0d9-482c-a280-8d8ec486f6d7"},
                             {category: "Challenges",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FChallenges.svg?alt=media&token=8a3ab704-b281-427e-bacd-3ea4abddd6db"},
                             {category: "Comedy",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FComedy.svg?alt=media&token=c92077ca-18e1-427c-96d1-075897e63e21"},
                             {category: "Commentary",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FCommentary.svg?alt=media&token=218ff80a-c91f-4588-9a44-7a59180c2ca4"},
                             {category: "Cooking",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FCooking.svg?alt=media&token=1d7c1872-90fa-4926-bf00-c1107a2af52d"},
                             {category: "Dance",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FDance.svg?alt=media&token=950eb741-d928-491e-a492-91c492954800"},
                             {category: "Design",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FDesign.svg?alt=media&token=f7122df2-fc28-4986-8b8b-90318a8da9fd"},
                             {category: "Devotion",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FDevotion.svg?alt=media&token=6e5b48d1-6b36-4ad0-a488-ad59b4919ca2"},
                             {category: "Economic",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FEconomic.svg?alt=media&token=20e2e78c-c44d-4bf2-8a1b-cd962849b6a4"},
                             {category: "Education",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FEducation.svg?alt=media&token=70aa6313-3329-40b4-9bdf-f54d32ddbf90"},
                             {category: "Fashion",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FFashion.svg?alt=media&token=26ba965b-ebbb-4099-adbc-ec142637a011"},
                             {category: "Food",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FFood.svg?alt=media&token=81f2c49d-64f2-40b4-86c9-94fb0bd0c96b"},
                             {category: "Gaming",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FGaming.svg?alt=media&token=6a384302-d600-4041-a320-cefc39aed4c5"},
                             {category: "Handcraft",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FHandcraft.svg?alt=media&token=65b58caf-bf79-4d92-81e0-4e4b80aff3ba"},
                             {category: "Health&Fitness",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FHealth%20%26%20Fitness.svg?alt=media&token=5cb5cc23-974c-40f9-86e6-1f9e98f0bd32"},
                             {category: "Learning",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FLearning.svg?alt=media&token=fa82f07b-ab0d-4b37-9716-c3fc1c8d36b5"},
                             {category: "Lifestyle",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FLifestyle.svg?alt=media&token=36270002-9c72-464a-977b-79f4563103e1"},
                             {category: "Movie Shows",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FMovie%20Shows.svg?alt=media&token=009f9b6d-42b2-4dd6-8c68-c488b2197fa4"},
                             {category: "Music",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FMusic.svg?alt=media&token=d0a1bff9-3319-44a3-b76f-709989000acf"},
                             {category: "Nature",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FNature.svg?alt=media&token=4c0ba3f7-0d29-479e-9240-ccc0eadebb2a"},
                             {category: "Poetry",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FPoetry.svg?alt=media&token=d9661378-0fa2-4add-9061-5ee250495677"},
                             {category: "Politics",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FPolitics.svg?alt=media&token=7afd3a0e-6257-44e6-bb1f-31629d0666e8"},
                             {category: "Q&A",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FQ%26A.svg?alt=media&token=61d3002f-e235-41ee-8c86-bd1d3852567f"},
                             {category: "Science",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FScience.svg?alt=media&token=56642052-57e0-4507-8c35-e6e1886d5f0a"},
                             {category: "Serials",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FSerials.svg?alt=media&token=5ae8ed0c-238b-4508-845d-db1eb6a6c62e"},
                             {category: "Social Issues",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FSocial%20%20Issues.svg?alt=media&token=95ae843c-def8-4bc6-9984-f7f4f22d6c45"},
                             {category: "Sport",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FSport.svg?alt=media&token=a9e86070-e65d-4a81-8b1a-12f69fb48974"},
                             {category: "Technology",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FTechnology.svg?alt=media&token=a88faf59-e504-4cf4-b5a2-e582229a3048"},
                             {category: "Travel",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FTravel.svg?alt=media&token=632b5516-b029-411a-a532-ebf78554f2a2"},
                             {category: "Trending",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2Ftrending.svg?alt=media&token=098477bc-84bf-4c5f-a79d-8d2269af81bc"},
                             {category: "Writing",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/Category%2FWriting.svg?alt=media&token=2e12d35f-d793-4a3f-87fe-1039ba5c66fa"},
                             {category: "News",image: "https://firebasestorage.googleapis.com/v0/b/pixalive-flutter.appspot.com/o/News.svg?alt=media&token=d3dbd56d-639a-4613-a57d-81157b526226"}
                             ];
        const saveData = await Category.create(totalCategory);
        if (saveData) {
            return res.json({
                success: true,
                message: "Category created successfully"
            });
        }
}

exports.fetchCategory = async (req, res, next) => {

        const getAllcategory = await Category.find({}).exec();
        if (getAllcategory) 
        {
            return res.json({
                success: true,
                category: getAllcategory,
                message: "Category fetched successfully"
            })
        }
}


//feedBack
module.exports.sendFeedback = async (req, res, next) => {

        const { username, user_id, text, media } = req.body;

        const output = `
    <p>You have a new feedback </p>
    <h3>User Feedback Details</h3>
    <ul>  
      <li>username: ${username}</li>
      <li>user_id: ${user_id}</li>
      <li>text: ${text}</li>
      <li>media: ${media}</li>
    </ul>
  `;

        // create reusable transporter object using the default SMTP transport
        // let transporter = nodemailer.createTransport({
        //     // host: 'mail.YOURDOMAIN.com',
        //     // port: 587,
        //     service: 'gmail',
        //     secure: false, // true for 465, false for other ports
        //     auth: {
        //         user: 'Pixalivetesting@gmail.com', // generated ethereal user
        //         pass: 'Welcome@123'  // generated ethereal password
        //     },
        //     tls: {
        //         rejectUnauthorized: false
        //     }
        // });

        // // setup email data with unicode symbols
        // let mailOptions = {
        //     from: 'Pixalivetesting@gmail.com', // sender address
        //     to: 'Pixalivetesting@gmail.com', // list of receivers
        //     subject: 'Users Feedback', // Subject line
        //     html: output,
        //     attachments: [
        //         { filename: 'profile_avatar/steps.png', path: './profile_avatar/steps.png' } // TODO: replace it with your own image
        //     ]
        // };

        // // send mail with defined transport object
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         return console.log(error);
        //     } else {
        //     //console.log('Message sent: %s', info.messageId);
        //     return res.json({
        //         success : true,
        //         message : "Feedback sent successufly",
        //         info : info.messageId
        //     })
        // }
        // });
        return res.json({
            success: true,
            message: "Feedback sent successufly"
        })
}