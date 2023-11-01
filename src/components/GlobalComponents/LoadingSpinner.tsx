import React from "react"
import loadingGif from "../../images/loading.gif"

const LoadingSpinner = () => (
  <div>
    <img src={loadingGif} width={320} height={250} alt="Loading" />
  </div>
)

export default LoadingSpinner
