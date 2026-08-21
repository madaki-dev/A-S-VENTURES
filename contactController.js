const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


exports.sendContactMessage = async (req, res) => {

    try {

        const {
            name,
            email,
            subject,
            message
        } = req.body;


        // ==============================
        // VALIDATION
        // ==============================

        if (
            !name ||
            !email ||
            !message
        ) {

            return res.status(400).json({
                message:
                    "Please complete all required fields."
            });

        }


        // ==============================
        // SEND EMAIL
        // ==============================

        await transporter.sendMail({

            from:
                process.env.EMAIL_USER,

            to:
                process.env.EMAIL_USER,

            replyTo:
                email,

            subject:
                subject
                    ? `A&S Agri Contact: ${subject}`
                    : `New Contact Message from ${name}`,

            html: `
                <h2>New Contact Message</h2>

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

                <p>
                    <strong>Message:</strong>
                </p>

                <p>
                    ${message.replace(/\n/g, "<br>")}
                </p>
            `

        });


        // ==============================
        // SUCCESS
        // ==============================

        res.status(200).json({

            message:
                "Your message has been sent successfully."

        });


    } catch (error) {

        console.error(
            "CONTACT EMAIL ERROR:",
            error
        );

        res.status(500).json({

            message:
                "Failed to send message. Please try again later."

        });

    }

};