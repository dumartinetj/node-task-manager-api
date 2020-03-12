const sgMailer = require("@sendgrid/mail");

sgMailer.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = user => {
  sgMailer.send({
    to: user.email,
    from: "dumartinetj@gmail.com",
    subject: "Welcome to App",
    text: `Welcome to the app, ${user.firstname}. We are glad to have you here !`
  });
};

const sendDeletionEmail = user => {
  sgMailer.send({
    to: user.email,
    from: "dumartinetj@gmail.com",
    subject: "Your account was deleted",
    text: `Hello ${user.firstname},We are sorry to see you leave !`,
    html: `Hi ${user.firstname},<br/>Your account was deleted and we are very sorry to see you leave. Could you please write us and give us a feedback on the reasons that made you leave ? This feedback is very valuable for us to improve.`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendDeletionEmail
};
