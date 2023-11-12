import React, { useState } from "react"

const SendMail = () => {
  const [formState, setFormState] = useState({})

  const changeHandler = (event) => {
    setFormState({ ...formState, [event.target.name]: event.target.value })
  }

  const submitHandler = (event) => {
    event.preventDefault()
    const config = {
      SecureToken: "22702cec-d366-41e2-9ad3-2b3cf6c6f560",
      To: "kosgkagiannis@gmail.com",
      From: formState.email,
      Subject: "This is the subject",
      Body: "And this is the body",
    }
    if (window.Email) {
      window.Email.send(config).then(() => alert("email sent successfully"))
    }
  }

  return (
    <div>
      <form onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="Your Name"
          name="name"
          value={formState.name || ""}
          onChange={changeHandler}
        />
        <input
          type="email"
          name="email"
          value={formState.email || ""}
          placeholder="Your email"
          onChange={changeHandler}
        />
        <input type="submit" value="Send Email" />
      </form>
    </div>
  )
}

export default SendMail
