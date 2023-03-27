export class Synth {
  ctx: AudioContext
  oscList: OscillatorNode[]
  mainGainNode: GainNode

  noteFreq: number = 440

  customWaveform: PeriodicWave | null = null
  sineTerms: Float32Array | null = null
  cosineTerms: Float32Array | null = null
  constructor(volume: number = 0.5) {
    this.ctx = new AudioContext()
    this.oscList = []
    this.mainGainNode = this.ctx.createGain()
    this.mainGainNode.connect(this.ctx.destination)
    this.mainGainNode.gain.value = volume

    this.sineTerms = new Float32Array([0, 0, 1, 0, 1])
    this.cosineTerms = new Float32Array(this.sineTerms.length)
    this.customWaveform = this.ctx.createPeriodicWave(this.cosineTerms, this.sineTerms)
    for (let i = 0; i < 9; i++) {
      this.oscList[i] = null
    }
  }

  playTone(freq: number) {
    const osc = this.ctx.createOscillator()
    osc.connect(this.mainGainNode)

    // if (type === "custom") {
    //   osc.setPeriodicWave(customWaveform);
    // } else {
    osc.type = 'sine'
    // }

    osc.frequency.value = freq
    osc.start()

    return osc
  }

  playNote(speed: number) {
    this.noteFreq = this.noteFreq + speed * 100
    const index = this.oscList.length
    const synth = this.playTone(this.noteFreq)
    // this.oscList[index] = synth

    synth.stop(this.ctx.currentTime + 0.2)
  }
}
