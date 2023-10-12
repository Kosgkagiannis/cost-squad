import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db } from "../../config/firebase"

const GroupExpenseDetails = () => {
  const { groupId, expenseId } = useParams()
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [showImageMessage, setShowImageMessage] = useState(false)
  const [expenseData, setExpenseData] = useState<{
    description: string
    amount: number
    timestamp: Date | null
    shared: boolean
    imageUrls: string[]
  }>({
    description: "",
    amount: 0,
    timestamp: null,
    shared: false,
    imageUrls: [],
  })

  const handleCustomUploadClick = () => {
    document.getElementById("fileInput")?.click()
  }

  const displayImageMessage = (message: string) => {
    setShowImageMessage(true)

    setTimeout(() => {
      setShowImageMessage(false)
    }, 5000)
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      try {
        const storage = getStorage()

        const storageRef = ref(
          storage,
          `expenses/${groupId}/${expenseId}/${file.name}`
        )
        setImageFileName(file.name)

        await uploadBytes(storageRef, file)

        const imageUrl = await getDownloadURL(storageRef)

        const expenseDocRef = doc(db, "groups", groupId, "expenses", expenseId)
        const existingImageUrls = expenseData.imageUrls || [] // Get existing URLs
        const updatedImageUrls = [...existingImageUrls, imageUrl]

        await updateDoc(expenseDocRef, { imageUrls: updatedImageUrls })

        setExpenseData({ ...expenseData, imageUrls: updatedImageUrls })
        displayImageMessage(`Selected Image: ${file.name}`)
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
  }

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        if (!groupId || !expenseId) {
          console.error("Group ID or Expense ID is undefined")
          return
        }

        const expenseDocRef = doc(db, "groups", groupId, "expenses", expenseId)
        const expenseDocSnapshot = await getDoc(expenseDocRef)

        if (expenseDocSnapshot.exists()) {
          const expenseData = expenseDocSnapshot.data()
          setExpenseData({
            description: expenseData.description,
            amount: expenseData.amount,
            timestamp: expenseData.timestamp.toDate(),
            shared: expenseData.shared,
            imageUrls: expenseData.imageUrls || [],
          })
        } else {
          console.error("Expense document does not exist.")
        }
      } catch (error) {
        console.error("Error fetching expense data:", error)
      }
    }

    fetchExpenseData()
  }, [groupId, expenseId])

  return (
    <div>
      <h2>Expense Details</h2>
      <p>Description: {expenseData.description}</p>
      <p>Amount: {expenseData.amount}</p>
      <p>
        Date and Time:
        {expenseData.timestamp
          ? (expenseData.timestamp as Date).toLocaleString()
          : "N/A"}
      </p>
      <p>Shared: {expenseData.shared ? "Yes" : "No"}</p>
      {expenseData.imageUrls.length > 0 && (
        <div>
          {expenseData.imageUrls.map((imageUrl, index) => (
            <img key={index} src={imageUrl} style={{ maxWidth: "10%" }} />
          ))}
        </div>
      )}
      {/* <br />
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br /> */}

      <div className="custom-upload-button" onClick={handleCustomUploadClick}>
        <span>Upload Image</span>
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </div>
      {showImageMessage && (
        <p>Selected Image: {imageFileName || "No image selected"}</p>
      )}
    </div>
  )
}

export default GroupExpenseDetails
