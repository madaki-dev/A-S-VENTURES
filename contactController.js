const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: "142.250.102.109",

    port: 587,

    secure: false,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});

// ==============================
// VERIFY GMAIL CONNECTION
// ==============================

transporter.verify((error, success) => {

    if (error) {

        console.error(
            "🔥 GMAIL CONNECTION FAILED:"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Command:",
            error.command
        );

        console.error(
            "Response:",
            error.response
        );

    } else {

        console.log(
            "✅ GMAIL SMTP CONNECTION READY"
        );

    }

});


// ==============================
// SEND CONTACT MESSAGE
// ==============================

exports.sendContactMessage = async (req, res) => {

    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body;


        console.log(
            "📩 CONTACT REQUEST:",
            {
                name,
                email,
                subject
            }
        );


        if (!name || !email || !message) {

            return res.status(400).json({

                message:
                    "Please complete your name, email and message."

            });

        }


        const mailOptions = {

            from: process.env.EMAIL_USER,

            to: process.env.EMAIL_USER,

            replyTo: email,

            subject:
                subject ||
                `New A&S Agri Contact Message from ${name}`,

            html: `

                <h2>New A&S Agri Contact Message</h2>

                <p>
                    <strong>Name:</strong>
                    ${name}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${email}
                </p>

                <p>
                    <strong>Subject:</strong>
                    ${subject || "No subject"}
                </p>

                <hr>

                <h3>Message:</h3>

                <p>
                    ${message.replace(/\n/g, "<br>")}
                </p>

            `

        };


        console.log(
            "📤 SENDING EMAIL..."
        );


        const info =
            await transporter.sendMail(
                mailOptions
            );


        console.log(
            "✅ EMAIL SENT:",
            info.messageId
        );


        res.status(200).json({

            message:
                "Your message has been sent successfully."

        });


    } catch (error) {

        console.error(
            "🔥 CONTACT EMAIL ERROR"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Command:",
            error.command
        );

        console.error(
            "Response:",
            error.response
        );

        res.status(500).json({

            message:
                "Failed to send message."

        });

    }

};