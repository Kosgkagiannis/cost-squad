import React from "react"
import loadingGif from "../../images/loading3.gif"

const LoadingSpinner = () => (
  <div>
    <img src={loadingGif} width={120} height={120} alt="Loading" />
  </div>
)

export default LoadingSpinner
