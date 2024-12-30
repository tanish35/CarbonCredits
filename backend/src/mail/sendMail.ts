import nodemailer from "nodemailer";

const sendMail = (
  htmlContent: any,
  receiverEmail: string,
  subject: any = "Verification Email"
) => {
  const port = process.env.SMTP_PORT;
  const host = process.env.SMTP_HOST;
  const senderEmail = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;
  let transporter = nodemailer.createTransport({
    // @ts-ignore
    host: "smtp.gmail.com",
    port: port,
    secure: true,
    auth: {
      user: host,
      pass: password,
    },
  });

  let mailOptions = {
    from: `"Campus-Chatter Admin" <${senderEmail}>`,
    to: receiverEmail,
    subject: subject,
    text: htmlContent,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error while sending email:", error);
    }
    // console.log('Email sent successfully:', info.response);
  });
};

export default sendMail;