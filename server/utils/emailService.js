const nodemailer = require('nodemailer');

// Create a transporter (you can configure this with your email service)
const createTransporter = () => {
  // For development, you can use a test account or configure with your email service
  // This is a basic configuration - you should replace with your actual email service
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'your-app-password'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@serendibgo.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email
const sendBookingConfirmation = async (bookingData) => {
  const { user, booking, service } = bookingData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your booking has been confirmed!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details</h3>
        <p><strong>Service:</strong> ${service.name}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ${booking.currency} ${booking.totalAmount}</p>
      </div>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Booking Confirmation - ${service.name}`,
    html
  });
};

// Send rental confirmation email
const sendRentalConfirmation = async (rentalData) => {
  const { user, rental, vehicle } = rentalData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Vehicle Rental Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your vehicle rental has been confirmed!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Rental Details</h3>
        <p><strong>Vehicle:</strong> ${vehicle.brand} ${vehicle.model}</p>
        <p><strong>Rental ID:</strong> ${rental._id}</p>
        <p><strong>Start Date:</strong> ${new Date(rental.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(rental.endDate).toLocaleDateString()}</p>
        <p><strong>Duration:</strong> ${rental.rentalDuration} ${rental.rentalType}</p>
        <p><strong>Total Amount:</strong> ${rental.currency} ${rental.totalAmount}</p>
      </div>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Vehicle Rental Confirmation - ${vehicle.brand} ${vehicle.model}`,
    html
  });
};

// Send password reset email
const sendPasswordResetEmail = async (userData, resetToken) => {
  const { name, email } = userData;
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Dear ${name},</p>
      <p>You have requested to reset your password for your SerendibGo account.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
      
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - SerendibGo',
    html
  });
};

// Send email verification email
const sendEmailVerification = async (userData, verificationToken) => {
  const { name, email } = userData;
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Verify Your Email Address</h2>
      <p>Dear ${name},</p>
      <p>Welcome to SerendibGo! Please verify your email address to complete your registration.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
      
      <p><strong>This link will expire in 24 hours.</strong></p>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - SerendibGo',
    html
  });
};

// Send booking reminder email
const sendBookingReminder = async (bookingData) => {
  const { user, booking, service } = bookingData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Upcoming Booking Reminder</h2>
      <p>Dear ${user.name},</p>
      <p>This is a friendly reminder about your upcoming booking!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Booking Details</h3>
        <p><strong>Service:</strong> ${service.name}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
        <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date(booking.startDate).toLocaleTimeString()}</p>
        <p><strong>Total Amount:</strong> ${booking.currency} ${booking.totalAmount}</p>
      </div>
      
      <p>Please arrive on time and bring any required documents.</p>
      <p>If you need to make any changes, please contact us as soon as possible.</p>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: `Booking Reminder - ${service.name}`,
    html
  });
};

// Send payment confirmation email
const sendPaymentConfirmation = async (paymentData) => {
  const { user, payment, booking } = paymentData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Payment Confirmation</h2>
      <p>Dear ${user.name},</p>
      <p>Your payment has been processed successfully!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details</h3>
        <p><strong>Payment ID:</strong> ${payment.orderId}</p>
        <p><strong>Amount:</strong> ${payment.currency} ${payment.amount}</p>
        <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
        <p><strong>Status:</strong> ${payment.status}</p>
        <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</p>
      </div>
      
      <p>Your booking is now confirmed. You will receive a separate confirmation email with booking details.</p>
      
      <p>Thank you for choosing SerendibGo!</p>
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Payment Confirmation - SerendibGo',
    html
  });
};

// Send refund notification email
const sendRefundNotification = async (refundData) => {
  const { user, payment, refundAmount, reason } = refundData;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Refund Processed</h2>
      <p>Dear ${user.name},</p>
      <p>Your refund has been processed successfully!</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Refund Details</h3>
        <p><strong>Original Payment ID:</strong> ${payment.orderId}</p>
        <p><strong>Refund Amount:</strong> ${payment.currency} ${refundAmount}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Refund Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <p>The refund will be credited to your original payment method within 5-10 business days.</p>
      
      <p>If you have any questions, please contact our support team.</p>
      
      <p>Best regards,<br>The SerendibGo Team</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Refund Processed - SerendibGo',
    html
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendRentalConfirmation,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendBookingReminder,
  sendPaymentConfirmation,
  sendRefundNotification
};
