import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import { db } from "../../config/firebase"
import ImageModal from "../GlobalComponents/ImageModal"
import { useNavigate } from "react-router-dom"

const GroupExpenseDetails = () => {
  const { groupId, expenseId } = useParams()
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [showImageMessage, setShowImageMessage] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const navigate = useNavigate()
  const [expenseData, setExpenseData] = useState<{
    description: string
    amount: number
    timestamp: Date | null
    shared: boolean
    imageUrls: string[]
    comments: string[]
  }>({
    description: "",
    amount: 0,
    timestamp: null,
    shared: false,
    imageUrls: [],
    comments: [],
  })

  const deleteExpense = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    )

    if (confirmDelete) {
      try {
        const expenseRef = doc(db, "groups", groupId, "expenses", expenseId)

        const expenseDocSnapshot = await getDoc(expenseRef)
        if (expenseDocSnapshot.exists()) {
          const expenseData = expenseDocSnapshot.data()

          for (const imageUrlToDelete of expenseData.imageUrls) {
            const storage = getStorage()
            const imageRef = ref(storage, imageUrlToDelete)
            await deleteObject(imageRef)
          }
        }

        const debtsCollectionRef = collection(expenseRef, "debts")
        const debtsQuerySnapshot = await getDocs(debtsCollectionRef)

        const batch = writeBatch(db)

        debtsQuerySnapshot.forEach((debtDoc) => {
          batch.delete(debtDoc.ref)
        })

        await batch.commit()

        await deleteDoc(expenseRef)
        // need to delete firestore document too with this
        await deleteDoc(expenseRef)
        navigate(`/edit-group/${groupId}`)
      } catch (error) {
        console.error("Error deleting expense:", error)
      }
    }
  }

  const addComment = (comment: string) => {
    if (comment) {
      const updatedComments = [...expenseData.comments, comment]
      setExpenseData({ ...expenseData, comments: updatedComments })
      setCommentInput("")
      addCommentToFirestore(comment)
    }
  }

  const addCommentToFirestore = async (comment: string) => {
    try {
      const expenseRef = doc(db, "groups", groupId, "expenses", expenseId)
      await updateDoc(expenseRef, {
        comments: [...expenseData.comments, comment],
      })
    } catch (error) {
      console.error("Error adding comment to Firestore:", error)
    }
  }

  const handleImageClick = (imageUrl: string) => {
    setModalImageUrl(imageUrl)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleCustomUploadClick = () => {
    document.getElementById("fileInput")?.click()
  }

  const displayImageMessage = (message: string) => {
    setShowImageMessage(true)

    setTimeout(() => {
      setShowImageMessage(false)
    }, 5000)
  }

  const deleteImage = async (imageUrlToDelete: string) => {
    try {
      const storage = getStorage()
      const imageRef = ref(storage, imageUrlToDelete)
      await deleteObject(imageRef)

      const updatedImageUrls = expenseData.imageUrls.filter(
        (imageUrl) => imageUrl !== imageUrlToDelete
      )
      const expenseDocRef = doc(db, "groups", groupId, "expenses", expenseId)
      await updateDoc(expenseDocRef, { imageUrls: updatedImageUrls })

      setExpenseData({ ...expenseData, imageUrls: updatedImageUrls })
      closeModal()
    } catch (error) {
      console.error("Error deleting image:", error)
    }
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
        const existingImageUrls = expenseData.imageUrls || []
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
            comments: expenseData.comments || [],
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

  const deleteComment = (commentIndex: number) => {
    const updatedComments = [...expenseData.comments]
    updatedComments.splice(commentIndex, 1)

    const expenseRef = doc(db, "groups", groupId, "expenses", expenseId)
    updateDoc(expenseRef, {
      comments: updatedComments,
    })
    setExpenseData({ ...expenseData, comments: updatedComments })
  }

  return (
    <div>
      <button style={{ background: "red" }} onClick={deleteExpense}>
        Delete Expense
      </button>
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

      {/* <br />
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br /> */}

      <div>
        <h3>Comments</h3>
        <ul>
          {expenseData.comments.map((comment, index) => (
            <li key={index}>
              {comment}
              <button onClick={() => deleteComment(index)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Input field for adding comments */}
      <input
        type="text"
        placeholder="Add a comment"
        value={commentInput}
        onChange={(e) => setCommentInput(e.target.value)}
      />
      <button onClick={() => addComment(commentInput)}>Add Comment</button>
      <br></br>
      <div className="custom-upload-button" onClick={handleCustomUploadClick}>
        <span>Upload Receipt</span>
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
      {isModalOpen && (
        <ImageModal
          imageUrl={modalImageUrl}
          closeModal={closeModal}
          deleteImage={() => deleteImage(modalImageUrl)}
        />
      )}
      {expenseData.imageUrls.length > 0 && (
        <div className="image-gallery">
          {expenseData.imageUrls.map((imageUrl, index) => (
            <div key={index} className="image-item">
              <img
                src={imageUrl}
                alt={``}
                onClick={() => handleImageClick(imageUrl)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupExpenseDetails
