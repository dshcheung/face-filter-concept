import React, { useState, useEffect } from 'react'
import produce from 'immer'
import Sketch from 'react-p5'

function FaceFilter() {
  // Is Ready for P5, Dimensions of Camera, Permission Error
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [permissionError, setPermissionError] = useState('')
  const [aspectRatio, setAspectRatio] = useState(0)
  const [dimensions, setDimensions] = useState(null)
  const [canvasContainer, setCanvasContainer] = useState(null)

  // P5 & CLMTracker
  const [tracker, setTracker] = useState(null)
  const [images, setImages] = useState({})
  const [video, setVideo] = useState(null)

  // Selected Face Filter
  const [selectedFilter, setSelectedFilter] = useState('')

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }).then((stream) => {
      const settings = stream.getVideoTracks()[0].getSettings()
      setAspectRatio(settings.aspectRatio)
      setIsCameraReady(true)
    }).catch(() => {
      setPermissionError('You need to allow access to your camera to use this app.')
    })
  }, [])

  useEffect(() => {
    if (canvasContainer) {
      window.test = canvasContainer
      setDimensions({
        w: canvasContainer.clientWidth,
        h: canvasContainer.clientWidth / aspectRatio
      })
    }
  }, [canvasContainer])

  const drawSpiderMan = (p5) => {
    // https://github.com/auduno/clmtrackr
    // Refer to the face diagram to understand positions
    // [0] = x | [1] = y
    const positions = tracker.getCurrentPosition()
    if (positions !== false) {
      p5.push()
      // width = (left cheek's x) - (right cheek's x) | 1.1 to make up for ears width
      const imageWidth = Math.abs(positions[13][0] - positions[1][0]) * 1.1
      // height = ((chin's y) - (highest of eyebrow's y)) * 1.2 | 1.2 to make up for forehead height
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 1.2
      // translate origin to center of image
      p5.translate(-imageWidth / 2, -imageHeight / 2)
      // draw spiderMan image by setting its origin position at middle of nose
      p5.image(images.spiderMan, positions[41][0], positions[41][1], imageWidth, imageHeight)
      p5.pop()
    }
  }

  const preload = (p5) => {
    p5.loadImage('https://i.ibb.co/9HB2sSv/spiderman-mask-1.png', (image) => {
      setImages(produce(images, (draft) => {
        draft.spiderMan = image
      }))
    })
  }

  const setup = (p5) => {
    // Canvas
    p5.pixelDensity(1)
    p5.createCanvas(dimensions.w, dimensions.h).parent(canvasContainer)

    // Webcam Capture
    const newVideo = p5.createCapture(p5.VIDEO)
    newVideo.size(dimensions.w, dimensions.h)
    newVideo.hide()
    setVideo(newVideo)

    // CLM Tracker
    const newTracker = new clm.tracker() // eslint-disable-line
    newTracker.init()
    newTracker.start(newVideo.elt)
    setTracker(newTracker)
  }

  const draw = (p5) => {
    // Draw Webcam to Canvas
    p5.image(video, 0, 0, dimensions.w, dimensions.h)

    // Apply Filter
    switch (selectedFilter) {
      case 'spider-man': {
        drawSpiderMan(p5)
        break
      }
      default: {
        break
      }
    }
  }

  const windowResized = (p5) => {
    const newDimensions = {
      w: canvasContainer.clientWidth,
      h: canvasContainer.clientWidth / aspectRatio
    }
    setDimensions(newDimensions)

    p5.pixelDensity(1)
    p5.resizeCanvas(newDimensions.w, newDimensions.h)
  }

  const applyFilter = (e) => {
    setSelectedFilter(e.target.value)
  }

  if (permissionError) return <h1 className="text-center">{permissionError}</h1>
  if (!isCameraReady) return <h1 className="text-center">Waiting Permissions</h1>

  return (
    <>
      <select onChange={applyFilter}>
        <option value="">None</option>
        <option value="spider-man">Spider Man</option>
      </select>

      <div className="canvas-container" ref={(elem) => elem && setCanvasContainer(elem)} />

      {
        canvasContainer ? (
          <Sketch
            preload={preload}
            setup={setup}
            draw={draw}
            windowResized={windowResized}
          />
        ) : (
          <h1 className="text-center">Loading Container</h1>
        )
      }
    </>
  )
}

export default FaceFilter
