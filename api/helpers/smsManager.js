const twilio = require("twilio");
const axios = require("axios");

class Twillio {
     async sendOtp(otp, receiverNo){
        const url = 'https://2factor.in/API/V1/2372fa0e-5edd-11eb-8153-0200cd936042/SMS/+91' + receiverNo + '/' + otp;
        try {
            const response = await axios.get(url);
        } catch (exception) {
            process.stderr.write(`ERROR received from ${url}: ${exception}\n`);
        }
} };

module.exports = Twillio;