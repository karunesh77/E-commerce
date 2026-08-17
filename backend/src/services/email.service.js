import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP settings
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// HTML email templates
const emailTemplates = {
  orderConfirmation: (orderData) => `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background: #f5f5f5; padding: 15px; margin: 15px 0; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${orderData.customerName},</p>
            <p>Thank you for your order! Here are the details:</p>

            <div class="order-details">
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
              <p><strong>Items:</strong> ${orderData.items}</p>
              <p><strong>Shipping Address:</strong><br/>
                ${orderData.shippingAddress.street}<br/>
                ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.postalCode}
              </p>
            </div>

            <div class="total">
              Total Amount: ₹${orderData.totalAmount}
            </div>

            <p>You can track your order using Order ID: <strong>${orderData.orderId}</strong></p>
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
    </html>
  `,

  orderShipped: (orderData) => `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .tracking { background: #f5f5f5; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Shipped!</h1>
          </div>
          <div class="content">
            <p>Dear ${orderData.customerName},</p>
            <p>Great news! Your order has been shipped.</p>

            <div class="tracking">
              <p><strong>Order ID:</strong> ${orderData.orderId}</p>
              <p><strong>Tracking ID:</strong> ${orderData.trackingId}</p>
              <p><strong>Courier:</strong> ${orderData.courier}</p>
              <p><strong>Expected Delivery:</strong> ${orderData.expectedDelivery}</p>
            </div>

            <p>Click below to track your shipment:</p>
            <p><a href="${orderData.trackingLink}">Track Your Order</a></p>

            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
    </html>
  `,

  passwordReset: (resetData) => `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; background: #ff9800; color: white; padding: 10px 20px; text-decoration: none; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to reset it:</p>

            <p>
              <a href="${resetData.resetLink}" class="button">Reset Password</a>
            </p>

            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `,
};

// Send email function
export const sendEmail = async (email, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
};

// Convenience functions for specific emails
export const sendOrderConfirmationEmail = async (email, orderData) => {
  const html = emailTemplates.orderConfirmation(orderData);
  return sendEmail(email, "Order Confirmation", html);
};

export const sendOrderShippedEmail = async (email, orderData) => {
  const html = emailTemplates.orderShipped(orderData);
  return sendEmail(email, "Your Order Has Shipped", html);
};

export const sendPasswordResetEmail = async (email, resetData) => {
  const html = emailTemplates.passwordReset(resetData);
  return sendEmail(email, "Password Reset Request", html);
};

export default {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPasswordResetEmail,
};
