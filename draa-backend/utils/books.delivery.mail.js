const { accountTransporter: transporter } = require("./mailConfig");

const sendDeliveryUpdateMail = async ({
  studentName,
  email,
  bookName,
  status,
  courier,
  trackingId,
  trackingUrl
}) => {

  const statusMessages = {
    packed:"Your order has been packed and will be shipped soon.",
    shipped:"Your order has been shipped.",
    out_for_delivery:"Your package is out for delivery.",
    delivered:"Your order has been delivered."
  };

  const html = `
    <div style="font-family:Arial;padding:20px">
      <h2> Draa Book Order Update</h2>

      <p>Hello <b>${studentName}</b>,</p>

      <p>${statusMessages[status] ||"Your order status has been updated."}</p>

      <h3>Order Details</h3>

      <p><b>Book:</b> ${bookName}</p>
      <p><b>Status:</b> ${status.toUpperCase()}</p>

      ${
        courier
          ? `<p><b>Courier:</b> ${courier}</p>`
          :""
      }

      ${
        trackingId
          ? `<p><b>Tracking ID:</b> ${trackingId}</p>`
          :""
      }

      ${
        trackingUrl
          ? `<p><a href="${trackingUrl}">Track your order</a></p>`
          :""
      }

      <br/>

      <p>Thank you for learning with <b>Draa</b>.</p>

      <p>Team Draa</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Draa" <account@draa.in>`,
    to: email,
    subject: `Your Book Order Status Updated - ${status}`,
    html
  });

};

module.exports = { sendDeliveryUpdateMail };