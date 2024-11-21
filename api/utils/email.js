import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "vickymuthunga@gmail.com", 
    pass: "phao chdg beqx cgla", 
  },
});

export const sendEmail = async (to, subject, content,attachments ) => {
  try {
    await transporter.sendMail({
      from: "vickymuthunga@gmail.com", 
      to: to, 
      subject: subject, 
      html: content, 
      attachments: attachments, 
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
