'use server';

import { Resend } from 'resend';

// This safely accesses your API key from your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStatusEmail(
  toEmail: string,
  adopterName: string,
  animalName: string,
  status: string
) {
  let subject = '';
  let htmlContent = '';

  if (status === 'approved') {
    subject = 'Great News! Your Adoption Application is Approved 🐾';
    htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #1a202c;">Congratulations, ${adopterName}!</h2>
        <p style="color: #4a5568; line-height: 1.6;">We are thrilled to let you know that your application to adopt <strong>${animalName}</strong> has been officially approved by the Shelter of Light team.</p>
        <p style="color: #4a5568; line-height: 1.6;">We will be in touch shortly with the next steps for finalizing the adoption and signing the contract in person.</p>
        <p style="color: #4a5568; line-height: 1.6;">Thank you for giving ${animalName} a loving forever home!</p>
        <br/>
        <p style="color: #4a5568;">Warmly,</p>
        <p style="color: #1a202c; font-weight: bold;">The Shelter of Light Team</p>
      </div>
    `;
  } else if (status === 'rejected') {
    subject = 'Update on your Adoption Application';
    htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #1a202c;">Hi ${adopterName},</h2>
        <p style="color: #4a5568; line-height: 1.6;">Thank you so much for your interest in adopting <strong>${animalName}</strong>.</p>
        <p style="color: #4a5568; line-height: 1.6;">After careful review, we regret to inform you that we are unable to approve your application at this time. We receive many applications and always strive to find the most suitable environment for each specific animal's needs.</p>
        <p style="color: #4a5568; line-height: 1.6;">We deeply appreciate your willingness to open your home to a rescue animal and encourage you to keep an eye on our website for other companions in the future.</p>
        <br/>
        <p style="color: #4a5568;">Warmly,</p>
        <p style="color: #1a202c; font-weight: bold;">The Shelter of Light Team</p>
      </div>
    `;
  } else if (status === 'interview') {
    subject = 'Next Steps: Interview Scheduled!';
    htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #1a202c;">Hi ${adopterName},</h2>
        <p style="color: #4a5568; line-height: 1.6;">We have reviewed your application for <strong>${animalName}</strong> and would love to move forward to the interview stage!</p>
        <p style="color: #4a5568; line-height: 1.6;">A member of our team will be reaching out to you shortly to schedule a video call and a virtual home check.</p>
        <br/>
        <p style="color: #4a5568;">Warmly,</p>
        <p style="color: #1a202c; font-weight: bold;">The Shelter of Light Team</p>
      </div>
    `;
  } else {
    return { success: true, message: 'No email needed for this status' };
  }

  try {
    const data = await resend.emails.send({
      from: 'Shelter of Light <onboarding@resend.dev>', 
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false, error };
  }
}

// THE FIX: New Email function specifically for Staff Approvals!
export async function sendStaffApprovalEmail(toEmail: string, staffName: string) {
  const subject = 'Your Shelter of Light Account has been Approved! 🎉';
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color: #1a202c;">Welcome to the Team, ${staffName}!</h2>
      <p style="color: #4a5568; line-height: 1.6;">An administrator has just reviewed and <strong>approved</strong> your staff account for the Shelter of Light Management Portal.</p>
      <p style="color: #4a5568; line-height: 1.6;">You can now log in using your email and password to access the dashboard and help us manage the shelter.</p>
      <br/>
      <a href="http://localhost:3000/login" style="display: inline-block; background-color: #f6e05e; color: #1a202c; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
      <br/><br/>
      <p style="color: #4a5568;">Warmly,</p>
      <p style="color: #1a202c; font-weight: bold;">Shelter of Light Administration</p>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'Shelter of Light <onboarding@resend.dev>',
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email failed:', error);
    return { success: false, error };
  }
}