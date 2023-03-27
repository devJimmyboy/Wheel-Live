import { ChatClient } from '@twurple/chat'
import { showOverlay } from './Overlay'
import gsap from 'gsap'
import { Howler, Howl } from 'howler'
// import { Synth } from './synth'
// import * as Tone from 'tone'
// import Observer from 'gsap/Observer'
// gsap.registerPlugin(Observer)

const url = new URL(window.location.href)

export class Wheel {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  chat: ChatClient
  segments: Segment[]
  outerRadius: number
  innerRadius: number
  numSegments: number
  drawMode: string
  rotationAngle: number
  textFontFamily: string
  textFontSize = 24
  textFontWeight = 'bold'
  textOrientation: string = 'horizontal'
  textAlignment: CanvasTextAlign = 'center'
  textDirection: string = 'normal'
  textMargin: number = null
  textFillStyle: string = 'white'
  textStrokeStyle: string = 'black'
  textLineWidth: number = 1.5
  fillStyle: string = 'silver'
  strokeStyle: string = 'black'
  lineWidth: number = 2
  // imageOverlay: boolean
  drawText: boolean
  pointerAngle: number = 90
  scale: number = 1
  hidden: boolean = url.searchParams.has('hidden')
  isSpinning: boolean = false
  lastSegment: Segment = null
  angularVelocity: number = 0
  lastRotation: number = 0
  lastTime: number = 0
  sounds = {
    tick: new Howl({
      src: `./sfx/${url.searchParams.get('tickSound') ?? 'pacifier'}.mp3`,
      mute: url.searchParams.get('mute')?.includes('tick') ?? false,
      volume: 0.15,
    }),
    twinkle: new Howl({
      src: './sfx/twinkle.mp3',
      mute: url.searchParams.get('mute')?.includes('twinkle') ?? false,
    }),
  }

  // synth?: Tone.Synth
  get totalWeight() {
    return this.segments.reduce((acc, segment) => acc + segment.weight, 0)
  }

  constructor() {
    this.canvas = document.getElementById('wheel') as HTMLCanvasElement
    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth
    this.outerRadius = Math.min(this.canvas.width, this.canvas.height) / 2.25
    this.innerRadius = this.outerRadius * 0.4
    // Get segments from local storage
    this.segments = JSON.parse(localStorage.getItem('segments') ?? '[]')
    this.recalculateSegments()
    this.ctx = this.canvas.getContext('2d')
    this.numSegments = 8
    this.rotationAngle = 0
    this.textFontFamily = '"Lilita One", Helvetica, sans-serif'
    this.drawText = true
    // this.imageOverlay = false
    // this.segments = []
    this.drawMode = 'segmentImage'
    this.scale = this.hidden ? 0.25 : 1
    console.log('hidden', this.hidden)
    Howler.volume(JSON.parse(localStorage.getItem('wheel-volume') ?? '0.25'))

    if (url.searchParams.has('synth')) {
      // this.synth = new Tone.Synth().toDestination()
    }

    requestAnimationFrame((t) => {
      this.draw.call(this, t)
    })
  }

  resizeCanvas() {
    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth
    this.outerRadius = Math.min(this.canvas.width, this.canvas.height) / 2.25
    this.innerRadius = this.outerRadius * 0.4
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  draw(t: number) {
    this.clearCanvas()
    // this.angularVelocity = ((this.rotationAngle - this.lastRotation) / (t - this.lastTime)) * 200
    // console.log(this.angularVelocity, t)
    // this.lastTime = t
    // this.lastRotation = this.rotationAngle
    if (this.hidden) return requestAnimationFrame((t) => this.draw(t))
    // scale from center
    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scale, this.scale)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
    this.drawWheel()
    this.drawPointer()
    this.ctx.restore()
    // draw text above wheel that says what section the pointer is on
    this.ctx.save()
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.scale(this.scale, this.scale)
    this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2)
    this.ctx.fillStyle = 'white'
    this.ctx.strokeStyle = 'black'
    this.ctx.lineWidth = 2
    this.ctx.font = 'bold 24px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    const currSegment = this.getCurrentSegment()
    if (currSegment.text !== this.lastSegment?.text) {
      this.lastSegment = currSegment
      this.sounds.tick.play()
    }
    if (currSegment) {
      this.ctx.strokeText(currSegment.text, this.canvas.width / 2, this.canvas.height / 2)
      this.ctx.fillText(currSegment.text, this.canvas.width / 2, this.canvas.height / 2)
    }
    this.ctx.restore()
    // this.drawSegments()
    //calculate angular velocity

    //   if (this.synth) {
    //     if (this.angularVelocity > 2) this.synth.triggerAttackRelease('C5', '16n')
    //     if (this.angularVelocity > 2) this.synth.triggerAttackRelease('G5', '16n')
    //     else if (this.angularVelocity > 1) this.synth.triggerAttackRelease('E4', '16n')
    //     else if (this.angularVelocity > 0.5) this.synth.triggerAttackRelease('D4', '16n')
    //     else if (this.synth.getLevelAtTime(Tone.now()) <= 0.05) this.synth.triggerAttackRelease('C4', '16n')
    //   }

    // request animation frame
    requestAnimationFrame((t) => this.draw(t))
  }

  drawWheel() {
    this.ctx.save()
    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.fillStyle = this.fillStyle
    this.ctx.lineWidth = this.lineWidth
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.rotate(this.rotationAngle)
    if (this.segments.length > 0) {
      const totalWeight = this.totalWeight
      let startingAngle = 2 * Math.PI
      for (let i = 0; i < this.segments.length; i++) {
        const segment = this.segments[i]
        const weight = segment.weight
        this.ctx.fillStyle = segment.color
        this.ctx.beginPath()
        this.ctx.moveTo(0, 0)
        const radiansPerWeight = (2 * Math.PI) / totalWeight
        const endingAngle = startingAngle - radiansPerWeight * weight
        // draw arc of segment depending on weight
        this.ctx.arc(0, 0, this.outerRadius, startingAngle, endingAngle, true)
        this.ctx.lineTo(0, 0)
        this.ctx.fill()
        this.ctx.stroke()
        this.ctx.closePath()
        // Draw segment text

        // weightDrawn += weight
        startingAngle = endingAngle
      }

      if (this.drawText) {
        for (const segment of this.segments) {
          this.ctx.save()
          this.ctx.textBaseline = 'middle'
          // draw text vertically in the midpoint of the arc
          // this.ctx.translate(0, 0)
          this.ctx.rotate(2 * Math.PI - (segment.startAngle + segment.endAngle) / 2)
          this.ctx.fillStyle = this.textFillStyle
          this.ctx.strokeStyle = this.textStrokeStyle
          this.ctx.lineWidth = this.textLineWidth
          this.ctx.font = `${this.textFontWeight} ${this.textFontSize}px ${this.textFontFamily}`
          this.ctx.textAlign = this.textAlignment
          this.ctx.textBaseline = 'middle'

          this.ctx.fillText(segment.text, this.outerRadius / 2, 0, (this.outerRadius * 2) / 3)
          this.ctx.strokeText(segment.text, this.outerRadius / 2, 0, (this.outerRadius * 2) / 3)
          this.ctx.restore()
        }
      }
    } else {
      this.ctx.beginPath()
      this.ctx.arc(0, 0, this.outerRadius, 0, Math.PI * 2)
      this.ctx.arc(0, 0, this.innerRadius, 0, Math.PI * 2)
      this.ctx.stroke()
      this.ctx.fill()
      this.ctx.closePath()
    }
    this.ctx.restore()
  }

  drawPointer() {
    this.ctx.save()
    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.fillStyle = this.fillStyle
    this.ctx.lineWidth = this.lineWidth
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.rotate((this.pointerAngle * Math.PI) / 180)
    this.ctx.beginPath()
    this.ctx.lineTo(-15, -this.outerRadius - 20)
    this.ctx.lineTo(15, -this.outerRadius - 20)
    this.ctx.lineTo(0, -this.outerRadius + 10)
    this.ctx.lineTo(-15, -this.outerRadius - 20)
    this.ctx.fill()
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.restore()
  }

  async spin() {
    if (this.isSpinning) return
    this.isSpinning = true
    if (this.hidden) {
      await this.show()
    }
    console.log('spinning')
    const tl = gsap.timeline()
    const spinTo = Math.floor(Math.random() * (2 * Math.PI))
    tl.fromTo(
      this,
      {
        rotationAngle: this.rotationAngle % (2 * Math.PI),
      },
      {
        rotationAngle: 80 * Math.PI + spinTo,
        duration: 7,
        ease: 'power3.out',
        // onUpdate: () => {
        //   if (this.rotationAngle % ((2 * Math.PI) / (2 * this.totalWeight)) <= 0.01) {
        //     if (!this.sounds.tick.playing()) this.sounds.tick.play()
        //   }
        // },
      }
    ).call(() => {
      this.revealResult().then(() => {
        this.isSpinning = false
      })
    })
  }

  spinByAngle(angle: number) {
    if (this.isSpinning) return
    this.isSpinning = true
    if (this.hidden) {
      this.show()
    }
    const angleInRadians = (angle * Math.PI) / 180
    gsap.to(this, {
      rotationAngle: `+=${angleInRadians}`,
      duration: 0.05,
      ease: 'linear',
      onComplete: () => {
        this.isSpinning = false
      },
    })
  }

  async show() {
    this.hidden = false
    await gsap.to(this, {
      scale: 1,
      duration: 0.25,
      ease: 'power4.out',
    })
  }

  async hide() {
    await gsap.to(this, {
      scale: 0.25,
      duration: 0.25,
      ease: 'power4.out',
      onComplete: () => {
        this.hidden = true
      },
    })
  }

  recalculateSegments() {
    const totalWeight = this.totalWeight
    let segmentStartAngle = 0

    for (const segment of this.segments) {
      const segmentEndAngle = segmentStartAngle + (2 * Math.PI * segment.weight) / totalWeight
      // console.log(`${segment.text} ${((segmentEndAngle * 180) / Math.PI) % 360}`)
      segment.startAngle = segmentStartAngle
      segment.endAngle = segmentEndAngle
      segmentStartAngle = segmentEndAngle
    }
  }
  addSegment(text: string, color: string, weight: number = 1) {
    this.segments.push({ text, color, weight })
    this.recalculateSegments()
    localStorage.setItem('segments', JSON.stringify(this.segments))
  }

  removeSegment(index: number) {
    this.segments.splice(index, 1)
    this.recalculateSegments()
    localStorage.setItem('segments', JSON.stringify(this.segments))
  }

  clearSegments() {
    this.segments = []
    this.recalculateSegments()
    localStorage.setItem('segments', JSON.stringify(this.segments))
  }

  getCurrentSegment() {
    // console.log(`${Math.floor(((this.rotationAngle * 180) / Math.PI) % 360)} degrees`)
    const angle = this.rotationAngle % (2 * Math.PI)

    for (const segment of this.segments) {
      // console.log(`${segment.text} ${((segmentEndAngle * 180) / Math.PI) % 360}`)
      if (angle >= segment.startAngle && angle < segment.endAngle) {
        return segment
      }
    }

    return null
  }

  async revealResult() {
    const segment = this.getCurrentSegment()
    console.log(segment.text)
    this.sounds.twinkle.play()
    await showOverlay(segment.text)
    if (url.searchParams.has('hidden')) await this.hide()
  }

  set volume(value: number) {
    localStorage.setItem('wheel-volume', JSON.stringify(value))
    Howler.volume(value)
  }
}

interface Segment {
  text: string
  color: string
  weight: number

  startAngle?: number
  endAngle?: number
}
