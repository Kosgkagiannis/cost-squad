import React, { useEffect, useState } from "react"
import QuickExpenseVideo from "../../videos/quick-expense-video.mp4"
import GroupsVideo from "../../videos/groups.mp4"
import CostSquad from "../../videos/costsquad.mp4"

interface WelcomeCarouselProps {
  onComplete: () => void
  visible: boolean
}

const WelcomeCarousel: React.FC<WelcomeCarouselProps> = ({
  onComplete,
  visible,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [visible])
  const slides = [
    {
      title: "Welcome to CostSquad!",
      description:
        "Manage and share expenses effortlessly with CostSquad. <br/><br/> Let's explore our two primary features: Squads and Quick Expense.",
      backgroundVideo: CostSquad,
    },
    {
      title: "Squads: <br/><br/> Share Bills with Ease",
      description:
        "Create groups and share expenses with your friends, family, or colleagues.<br/><br/> CostSquad simplifies the process of splitting bills and keeping track of who owes what. Easily manage group finances and eliminate confusion.",
      backgroundVideo: GroupsVideo,
    },
    {
      title: "Quick Expense: <br/><br/> Instantly Record Transactions",
      description:
        "For those spontaneous expenses, use Quick Expense to record transactions between two people with just a few taps.<br/><br/> It's perfect for those one-on-one reimbursements or simple shared costs.",
      backgroundVideo: QuickExpenseVideo,
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
        <h1
          className="carousel-title"
          dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
        ></h1>
        <p
          className="carousel-description"
          dangerouslySetInnerHTML={{ __html: slides[currentSlide].description }}
        ></p>
        {slides[currentSlide].backgroundVideo && (
          <div className="background-video-container">
            <video
              key={slides[currentSlide].backgroundVideo}
              width={180}
              height={180}
              autoPlay
              muted
              preload="auto"
              loop
              className="background-video"
            >
              <source
                src={slides[currentSlide].backgroundVideo}
                type="video/mp4"
              />
            </video>
          </div>
        )}
        <div className="carousel-nav">
          <div>
            <button onClick={onComplete}>Skip</button>
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
