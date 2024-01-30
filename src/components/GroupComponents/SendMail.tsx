import React from "react"

interface SendMailProps {
  memberName: string
  memberDebt: string
  memberEmail: string
  currency: string
}

const SendMail = ({
  memberName,
  memberDebt,
  memberEmail,
  currency,
}: SendMailProps) => {
  const handleSubmit = (e) => {
    e.preventDefault()

    const confirmed = window.confirm(
      "Are you sure you want to notify this member about their debts?"
    )

    if (!confirmed) {
      return
    }

    let ebody = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Dear ${memberName},</h2>
        <p>
          We hope this message finds you well. This is a notification regarding your financial status in the CostSquad application.
        </p>
        <p>
          As of the latest update, your total debt with the squad is ${memberDebt} ${currency}.
        </p>
        <p>
          To further discuss or clarify this matter, feel free to reach out with the owner of your squad.
        </p>
        <p>
          Sincerely, <br />
          CostSquad
        </p>
      </div>
    `

    window.Email.send({
      SecureToken: "22702cec-d366-41e2-9ad3-2b3cf6c6f560",
      To: memberEmail,
      From: "costsquad@gmail.com",
      Subject: "CostSquad - Debts Notification",
      Body: ebody,
    }).then((message) =>
      alert(
        "Email sent successfully. If the member can't find the email, kindly check the spam folder."
      )
    )
  }

  return (
    <div>
      {memberEmail.length > 0 ? (
        <form id="submit" onSubmit={handleSubmit}>
          <p>Email address: {memberEmail}</p>
          <input type="submit" value="Send email" />
        </form>
      ) : (
        <p>
          In order to notify this member about their debts, please add an email
          address.
        </p>
      )}
      <script src="https://smtpjs.com/v3/smtp.js"></script>
    </div>
  )
}

export default SendMail
