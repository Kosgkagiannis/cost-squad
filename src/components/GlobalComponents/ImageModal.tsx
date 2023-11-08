import React from "react"

interface ImageModalProps {
  imageUrl: string
  closeModal: () => void
  deleteImage: () => void
}

const ImageModal = ({ imageUrl, closeModal, deleteImage }: ImageModalProps) => {
  return (
    <div className="image-modal" onClick={closeModal} data-testid="image-modal">
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        <img
          src={imageUrl}
          alt="Fullscreen"
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
        <div className="delete-button">
          <button onClick={deleteImage}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default ImageModal
