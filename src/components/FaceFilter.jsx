// https://github.com/auduno/clmtrackr
// Refer to the face diagram to understand positions
// positions[face nodes][0 = x, 1 = y]

import React, { useState, useEffect } from 'react'
import produce from 'immer'
import Sketch from 'react-p5'

import imagesHat from '@/images/hat.png' // 687x703
import imagesHorn from '@/images/horn.png' // 231x563
import imagesEarLeft from '@/images/ear-left.png' // 182x295
import imagesEarRight from '@/images/ear-right.png' // 182x295
import imagesLamp from '@/images/lamp.png' // 179x242
import imagesMegaphone from '@/images/megaphone.png' // 398x241
import imagesSpiderman from '@/images/spiderman.png' // 385x500
import imageOption1 from '@/images/option1.png' // 761x674
import imageOption2 from '@/images/option2.png' // 780x421
import imageOption3 from '@/images/option3.png'// 786x679

function FaceFilter() {
  // Is Ready for P5, Dimensions of Camera, Permission Error
  const [isCanvasReady, setIsCanvasReady] = useState(false)
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
      setIsCanvasReady(true)
    }
  }, [canvasContainer])

  const drawSpiderMan = (p5) => {
    const positions = tracker.getCurrentPosition()
    if (positions !== false) {
      // height = ((chin's y) - (highest of brow's y)) * 1.2 | 1.2 to make up for forehead height
      // width = (left cheek's x) - (right cheek's x) * 1.05 | 1.05 to make up for ears width
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 1.2
      const imageWidth = Math.abs(positions[13][0] - positions[1][0]) * 1.05

      // translate origin to top(-50%) left(-50%) of image
      // draw spiderman image in the middle of face
      p5.push()
      p5.translate(-imageWidth / 2, -imageHeight / 2)
      p5.image(images.spiderman, positions[41][0], positions[41][1], imageWidth, imageHeight)
      p5.pop()
    }
  }

  const drawHorn = (p5) => {
    const positions = tracker.getCurrentPosition()
    if (positions !== false) {
      // height = ((chin's y) - (highest of eyebrow's y)) * 1.1 | 1.1 to make it slightly bigger
      // width = height * (original image width / original image height)
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 1.1
      const imageWidth = imageHeight * (231 / 563)

      // translate origin to top(-100%) left(-12.5%) of image
      // draw horn image in the middle of face and a little higher than brows | 0.95 to move up a little
      p5.push()
      p5.translate(-imageWidth / 2.5, -imageHeight)
      p5.image(images.horn, positions[41][0], Math.max(positions[16][1], positions[20][1]) * 0.95, imageWidth, imageHeight)
      p5.pop()
    }

    if (positions !== false) {
      // height = ((chin's y) - (highest of eyebrow's y))
      // width = height * (original image width / original image height)
      const imageWidth = Math.abs(positions[1][0] - positions[13][0]) * 0.3
      const imageHeight = imageWidth * (295 / 182)

      // translate origin to top(-100%) left(0) of image
      // draw earLeft on top of left cheek and a little higher than brows | 0.85 to move up a little
      p5.push()
      p5.translate(-imageWidth, -imageHeight)
      p5.image(images.earLeft, positions[27][0], Math.max(positions[16][1], positions[20][1]) * 0.85, imageWidth, imageHeight)
      p5.pop()

      // translate origin to top(-100%) left(-100%) of image
      // draw earRight on top of right cheek and a little higher than brows | 0.85 to move up a little
      p5.push()
      p5.translate(0, -imageHeight)
      p5.image(images.earRight, positions[32][0], Math.max(positions[16][1], positions[20][1]) * 0.85, imageWidth, imageHeight)
      p5.pop()
    }
  }

  const drawMegaphoneLamp = (p5) => {
    const positions = tracker.getCurrentPosition()

    // Megaphone
    if (positions !== false) {
      // height = ((chin's y) - (highest of eyebrow's y)) * 0.8 | 0.8 scale down to 80%
      // width = height * (original image width / original image height)
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 0.8
      const imageWidth = imageHeight * (398 / 241)

      // translate origin to top(-20%) left(-100%) of image
      // draw megaphone in the middle of face and a little higher than brows
      p5.push()
      p5.translate(-imageWidth, -imageHeight * 0.2)
      p5.image(images.megaphone, positions[44][0], positions[44][1], imageWidth, imageHeight)
      p5.pop()
    }

    // Lamp
    if (positions !== false) {
      // height = ((chin's y) - (middle of nose's y))
      // width = height * (original image width / original image height)
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[41][1]))
      const imageWidth = imageHeight * (179 / 242)

      // translate origin to top(-100%) left(-0%) of image
      // draw lamp in the middle of face and a little higher than brows
      p5.push()
      p5.translate(0, -imageHeight)
      p5.image(images.lamp, positions[13][0], positions[13][1], imageWidth, imageHeight)
      p5.pop()
    }
  }

  const drawHat = (p5) => {
    const positions = tracker.getCurrentPosition()
    if (positions !== false) {
      // width = (left cheek's x) - (right cheek's x) * 1.5 | 1.5 to actual size of image
      // height = width * (original image height / original image width)
      const imageWidth = Math.abs(positions[13][0] - positions[1][0]) * 2.25
      const imageHeight = imageWidth * (703 / 687)

      // translate origin to top(-50%) left(-47.5%) of image
      // draw hat in the middle of face and a little higher than brows | 0.8 to move up a little
      p5.push()
      p5.translate(-imageWidth * 0.475, -imageHeight * 0.5)
      p5.image(images.hat, positions[41][0], Math.max(positions[16][1], positions[20][1]) * 0.8, imageWidth, imageHeight)
      p5.pop()
    }
  }

  const drawOption1 = (p5) => {
    const positions = tracker.getCurrentPosition()

    if (positions !== false) {
      // height = ((chin's y) - (highest of brow's y)) * 2 | 2 to make up for image size
      // width = height * (original image width / original image height)
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 2
      const imageWidth = imageHeight * (761 / 674)

      // translate origin to top(-47%) left(-48%) of image
      // draw option1 image between eyes
      p5.push()
      p5.translate(-imageWidth * 0.47, -imageHeight * 0.47)
      p5.image(images.option1, positions[41][0], Math.max(positions[25][1], positions[30][1]), imageWidth, imageHeight)
      p5.pop()
    }
  }

  const drawOption2 = (p5) => {
    const positions = tracker.getCurrentPosition()

    if (positions !== false) {
      // height = ((chin's y) - (highest of brow's y)) * 2 | 1.2 to make up for image size
      // width = height * (original image width / original image height)
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 1.2
      const imageWidth = imageHeight * (780 / 421)

      // translate origin to top(-50%) left(-47%) of image
      // draw option2 image in the middle of face and a little higher than brows | 0.95 to move up a little
      p5.push()
      p5.translate(-imageWidth * 0.47, -imageHeight * 0.50)
      p5.image(images.option2, positions[41][0], Math.max(positions[16][1], positions[20][1]) * 0.9, imageWidth, imageHeight)
      p5.pop()
    }
  }

  const drawOption3 = (p5) => {
    const positions = tracker.getCurrentPosition()

    if (positions !== false) {
      // height = ((chin's y) - (highest of brow's y)) * 2 | 2 to make up for image size
      // width = height * (original image width / original image height)
      const imageHeight = Math.abs(positions[7][1] - Math.max(positions[16][1], positions[20][1])) * 2
      const imageWidth = imageHeight * (786 / 679)

      // translate origin to top(-49%) left(-47%) of image
      // draw option3 image between eyes
      p5.push()
      p5.translate(-imageWidth * 0.49, -imageHeight * 0.47)
      p5.image(images.option3, positions[41][0], Math.max(positions[25][1], positions[30][1]), imageWidth, imageHeight)
      p5.pop()
    }
  }

  const preload = (p5) => {
    const imageObjs = [
      { key: 'spiderman', image: p5.loadImage(imagesSpiderman) },
      { key: 'hat', image: p5.loadImage(imagesHat) },
      { key: 'horn', image: p5.loadImage(imagesHorn) },
      { key: 'earLeft', image: p5.loadImage(imagesEarLeft) },
      { key: 'earRight', image: p5.loadImage(imagesEarRight) },
      { key: 'lamp', image: p5.loadImage(imagesLamp) },
      { key: 'megaphone', image: p5.loadImage(imagesMegaphone) },
      { key: 'option1', image: p5.loadImage(imageOption1) },
      { key: 'option2', image: p5.loadImage(imageOption2) },
      { key: 'option3', image: p5.loadImage(imageOption3) }
    ]

    setImages(produce(images, (draft) => {
      imageObjs.forEach(({ key, image }) => {
        draft[key] = image
      })
    }))
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
      case 'spiderman': {
        drawSpiderMan(p5, tracker)
        break
      }
      case 'horn': {
        drawHorn(p5, tracker)
        break
      }
      case 'megaphone-lamp': {
        drawMegaphoneLamp(p5, tracker)
        break
      }
      case 'hat': {
        drawHat(p5, tracker)
        break
      }
      case 'option1': {
        drawOption1(p5, tracker)
        break
      }
      case 'option2': {
        drawOption2(p5, tracker)
        break
      }
      case 'option3': {
        drawOption3(p5, tracker)
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
    <div className="text-center">
      <select onChange={applyFilter}>
        <option value="">Select a Filter!</option>
        <option value="spiderman">Spiderman</option>
        <option value="horn">Horn</option>
        <option value="megaphone-lamp">Megaphone Lamp</option>
        <option value="hat">Hat</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>

      <div className={isCanvasReady ? 'd-flex justify-content-center mx-auto overflow-hidden' : ''} style={isCanvasReady ? { width: '320px' } : {}}>
        <div className="canvas-container" ref={(elem) => elem && setCanvasContainer(elem)} style={{ width: '500px' }} />
      </div>

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
    </div>
  )
}

export default FaceFilter
