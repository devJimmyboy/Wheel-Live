import * as confetti from 'canvas-confetti'
import gsap from 'gsap'

const confettiCanvas = document.getElementById('confetti') as HTMLCanvasElement
confettiCanvas.width = window.innerWidth
confettiCanvas.height = window.innerHeight
const doConfetti = confetti.create(confettiCanvas, {
  resize: true,
  useWorker: true,
})
const overlay = document.getElementById('overlay')
const overlayContent = document.getElementById('overlay-content')
const overlayTitle = document.getElementById('overlay-title')

gsap.set(overlay, {
  autoAlpha: 0,
})

gsap.set(overlayContent, {
  transformOrigin: 'center',
})

const tl = gsap
  .timeline({
    paused: true,
  })
  .to(overlay, {
    autoAlpha: 1,
    duration: 0.2,
  })
  .fromTo(
    overlayContent,
    {
      scale: 0.2,
    },
    {
      scale: 1,
      duration: 0.5,
    },
    0
  )
  .call(
    () => {
      doConfetti({
        particleCount: 250,
        spread: 100,
        startVelocity: 30,
        decay: 0.9,
        gravity: 1.5,
        origin: { x: 0.5, y: 0.5 },
      })
    },
    null,
    0.25
  )
  .to(
    overlayContent,
    {
      scale: 0.2,
      duration: 0.5,
    },
    6
  )
  .to(overlay, {
    autoAlpha: 0,
    duration: 0.5,
    onComplete: () => {
      doConfetti.reset()
    },
  })

export async function showOverlay(toShow: string) {
  overlayTitle.textContent = toShow
  await tl.play(0)
}
