import React, { useState } from "react"

interface WelcomeCarouselProps {
  onComplete: () => void
  visible: boolean
}

const WelcomeCarousel: React.FC<WelcomeCarouselProps> = ({
  onComplete,
  visible,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Welcome to CostSquad!",
      description:
        "Manage and share expenses effortlessly with CostSquad. Let's explore our two primary features: Groups and Quick Expense.",
    },
    {
      title: "Groups - Split Expenses Seamlessly",
      description:
        "Create groups and share expenses with your friends, family, or colleagues. CostSquad simplifies the process of splitting bills and keeping track of who owes what. Easily manage group finances and eliminate confusion.",
    },
    {
      title: "Quick Expense - Instantly Record Transactions",
      description:
        "For those spontaneous expenses, use Quick Expense to record transactions between two people with just a few taps. It's perfect for those one-on-one reimbursements or simple shared costs.",
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }
  return (
    <div className={`modal-overlay ${visible ? "visible" : ""}`}>
      <div className="welcome-carousel">
        <h1>{slides[currentSlide].title}</h1>
        <p>{slides[currentSlide].description}</p>

        <div className="carousel-nav">
          <div>
            <button onClick={onComplete} className="skip-button">
              Skip
            </button>
          </div>
          <div>
            <button
              onClick={prevSlide}
              className="nav-button"
              disabled={currentSlide === 0}
            >
              {"<"}
            </button>
            {currentSlide < slides.length - 1 && (
              <button onClick={nextSlide} className="nav-button">
                {">"}
              </button>
            )}

            {currentSlide === slides.length - 1 && (
              <button onClick={onComplete} className="nav-button">
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeCarousel
