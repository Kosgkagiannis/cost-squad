import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import { auth, db } from "../../config/firebase"
import ImageModal from "../GlobalComponents/ImageModal"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import LoadingAnimation from "../../images/loading2.gif"
import LoadingSpinner from "../GlobalComponents/LoadingSpinner"

const QuickExpenseDetails = () => {
  const { expenseId } = useParams()
  const [imageFileName, setImageFileName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [showImageMessage, setShowImageMessage] = useState(false)
  const [isCommentInputVisible, setCommentInputVisible] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentInput, setCommentInput] = useState("")
  const navigate = useNavigate()
  const [expenseData, setExpenseData] = useState<{
    person1: string
    person2: string
    amount: number
    currency: string
    timestamp: Date | null
    shared: boolean
    imageUrls: string[]
    comments: string[]
  }>({
    person1: "",
    person2: "",
    amount: 0,
    currency: "",
    timestamp: null,
    shared: false,
    imageUrls: [],
    comments: [],
  })

  const toggleCommentInput = () => {
    setCommentInputVisible(!isCommentInputVisible)
  }

  const handleDeleteExpense = async () => {
    if (expenseId) {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this expense?"
      )

      if (confirmDelete) {
        try {
          await deleteDoc(doc(db, "expenses2", expenseId))
          navigate("/quick-expense")
        } catch (error) {
          console.error("Error deleting expense: ", error)
        }
      }
    }
  }

  const addComment = (comment: string) => {
    if (comment) {
      const updatedComments = [...expenseData.comments, comment]
      setExpenseData({ ...expenseData, comments: updatedComments })
      setCommentInput("")
      addCommentToFirestore(comment)
      setCommentInputVisible(!isCommentInputVisible)
    }
  }

  const addCommentToFirestore = async (comment: string) => {
    try {
      const expenseRef = doc(db, "expenses2", expenseId)
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
      const expenseDocRef = doc(db, "expenses2", expenseId)
      await updateDoc(expenseDocRef, { imageUrls: updatedImageUrls })

      setExpenseData({ ...expenseData, imageUrls: updatedImageUrls })
      closeModal()
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
      } else {
        console.error("User is not signed in.")
        navigate("/")
      }
    })

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsLoadingImage(true)
    const file = event.target.files && event.target.files[0]
    if (file) {
      try {
        const storage = getStorage()

        const storageRef = ref(storage, `expenses/${expenseId}/${file.name}`)
        setImageFileName(file.name)

        await uploadBytes(storageRef, file)

        const imageUrl = await getDownloadURL(storageRef)

        const expenseDocRef = doc(db, "expenses2", expenseId)
        const existingImageUrls = expenseData.imageUrls || []
        const updatedImageUrls = [...existingImageUrls, imageUrl]

        await updateDoc(expenseDocRef, { imageUrls: updatedImageUrls })

        setExpenseData({ ...expenseData, imageUrls: updatedImageUrls })
        setTimeout(() => {
          displayImageMessage(`Selected Image: ${file.name}`)
          setIsLoadingImage(false)
        }, 1500)
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
  }

  useEffect(() => {
    const fetchExpenseData = async () => {
      setIsLoading(true)
      try {
        if (!expenseId) {
          console.error("Group ID or Expense ID is undefined")
          return
        }

        const expenseDocRef = doc(db, "expenses2", expenseId)
        const expenseDocSnapshot = await getDoc(expenseDocRef)

        if (expenseDocSnapshot.exists()) {
          const expenseData = expenseDocSnapshot.data()
          setExpenseData({
            person1: expenseData.person1,
            person2: expenseData.person2,
            amount: expenseData.amount,
            currency: expenseData.currency,
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
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }

    fetchExpenseData()
  }, [expenseId])

  const deleteComment = (commentIndex: number) => {
    const updatedComments = [...expenseData.comments]
    updatedComments.splice(commentIndex, 1)

    const expenseRef = doc(db, "expenses2", expenseId)
    updateDoc(expenseRef, {
      comments: updatedComments,
    })
    setExpenseData({ ...expenseData, comments: updatedComments })
  }

  const formatImageFileName = (fileName: string | null) => {
    if (fileName && fileName.length > 14) {
      const firstPart = fileName.slice(0, 10)
      const lastPart = fileName.slice(-4)
      return `${firstPart}...${lastPart}`
    }
    return fileName
  }

  return (
    <div>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <h2 className="group-title">Expense Details</h2>
          <button
            style={{ background: "#ff0000bd" }}
            onClick={handleDeleteExpense}
          >
            Delete Expense
          </button>
          <p>Person 1: {expenseData.person1}</p>
          <p>Person 2: {expenseData.person2}</p>
          <p>
            Amount: {expenseData.amount} {expenseData.currency}
          </p>
          <p>
            Date and Time:{" "}
            {expenseData.timestamp
              ? (expenseData.timestamp as Date).toLocaleString()
              : "N/A"}
          </p>

          {/* <br />
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <br /> */}
          <div className="divider" />

          <div>
            <h2>Comments</h2>
            <ul>
              {expenseData.comments.map((comment, index) => (
                <li
                  style={{ wordBreak: "break-word", marginBlockStart: "1rem" }}
                  key={index}
                >
                  <span>
                    {comment}
                    <button onClick={() => deleteComment(index)}>Delete</button>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {isCommentInputVisible ? (
            <>
              <input
                type="text"
                placeholder="Add a comment"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                maxLength={50}
              />
              <button onClick={() => addComment(commentInput)}>
                Add Comment
              </button>
              <button onClick={toggleCommentInput}>Cancel</button>
            </>
          ) : (
            <button onClick={toggleCommentInput}>Add Comment</button>
          )}
          <br></br>
          <div className="divider" />
          <h2>Receipts</h2>
          <div
            className="custom-upload-button"
            onClick={handleCustomUploadClick}
          >
            <span>Upload Receipt</span>
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>
          {isLoadingImage && (
            <img src={LoadingAnimation} width={48} height={48} alt="Loading" />
          )}
          {showImageMessage && (
            <p>
              Selected Image:
              {formatImageFileName(imageFileName) || "No image selected"}
            </p>
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
                    alt={`Gallery`}
                    onClick={() => handleImageClick(imageUrl)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default QuickExpenseDetails
