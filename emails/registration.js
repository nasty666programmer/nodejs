const keys = require('../keys');




module.exports = function (email) {
    return {
      to: email, // Change to your recipient
      from: "dev18ivanov@gmail.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html:`
            <h1>Welcome in our course shop</h1>

            <p>you have successfully created an account with an email: ${email}</p>
            <hr />
            <a href='${keys.BASE_URL}'> Shop courses </a>
        `
    };
  };