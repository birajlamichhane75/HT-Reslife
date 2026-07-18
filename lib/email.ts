import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMaintenanceConfirmation(
  to: string,
  ticketId: string,
  issueType: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Skipping email notification.')
      return
    }
    await resend.emails.send({
      from: 'HT Housing <housing@<<<REPLACE_WITH_YOUR_VERIFIED_RESEND_DOMAIN>>>',
      to,
      subject: `Maintenance request received — Ticket #${ticketId.slice(0, 8).toUpperCase()}`,
      html: `
        <p>Hi,</p>
        <p>We received your maintenance request for: <strong>${issueType}</strong>.</p>
        <p>Your ticket ID is <strong>#${ticketId.slice(0, 8).toUpperCase()}</strong>. A staff member will follow up within 48 hours.</p>
        <p>— HT Housing Office</p>
      `,
    })
  } catch (error) {
    console.error('Error sending maintenance confirmation email:', error)
  }
}

export async function sendTicketStatusUpdate(
  to: string,
  ticketId: string,
  newStatus: string,
  staffNotes: string | null
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Skipping email notification.')
      return
    }
    await resend.emails.send({
      from: 'HT Housing <housing@<<<REPLACE_WITH_YOUR_VERIFIED_RESEND_DOMAIN>>>',
      to,
      subject: `Your maintenance ticket has been updated`,
      html: `
        <p>Hi,</p>
        <p>Your maintenance ticket <strong>#${ticketId.slice(0, 8).toUpperCase()}</strong> status has changed to: <strong>${newStatus.replace('_', ' ')}</strong>.</p>
        ${staffNotes ? `<p>Staff note: ${staffNotes}</p>` : ''}
        <p>— HT Housing Office</p>
      `,
    })
  } catch (error) {
    console.error('Error sending ticket status update email:', error)
  }
}
