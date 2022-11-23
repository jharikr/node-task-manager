const sgMail = require('@sendgrid/mail');

//sgMail.setApiKey(process.env.SENDGRIP_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jharik.rdson@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app ${name}!. Let me know how get along with the app.`
    });
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jharik.rdson@gmail.com',
        subject: 'Sorry to see you go!!',
        text: `Goodbye ${name}. Hope to see you again!`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};