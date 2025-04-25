// pages/api/submit-application.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const submitApplicationHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const data = req.body as Record<string, any>
  const { type, name, email, phone, position, experience, opportunityType, company, message } = data

  const subject = type === 'job'
    ? `New Job Application from ${name}`
    : `New Collaboration Request from ${name}`

  let html = `<h2>${subject}</h2>
    <ul>
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone}</li>`

  if (type === 'job') {
    html += `<li><strong>Position:</strong> ${position}</li>
             <li><strong>Experience:</strong> ${experience}</li>`
  } else {
    html += `<li><strong>Opportunity Type:</strong> ${opportunityType}</li>
             <li><strong>Company:</strong> ${company}</li>
             <li><strong>Message:</strong> ${message}</li>`
  }

  html += `</ul>`

  try {
    await transporter.sendMail({
      from: `"Suma Barber Website" <${process.env.SMTP_USER}>`,
      to: 'santanamnaa8@gmail.com',
      subject,
      html,
    })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Mail error:', err)
    return res.status(500).json({ success: false, error: 'Failed to send email' })
  }
}

export { submitApplicationHandler }
export default submitApplicationHandler
