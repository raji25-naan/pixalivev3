const nodemailer = require('nodemailer');

module.exports.sendOtpToEmail = function(mailOptions) {
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'email-smtp.eu-west-1.amazonaws.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'AKIAVG3G3CSDSPXWYEBU', // generated ethereal user
                pass: 'BC5dB8Lf9hanT8nc+QZKPvo3xUB4EFu56ULWclK+n1Ai' // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return // console.log(error);
            }
            // console.log('Message sent: %s', info.messageId);
        });
    });

}
