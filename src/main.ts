import './app.postcss'
// Import our custom CSS
import $ from 'jquery'
import { Wheel } from './Wheel'
import './scss/styles.scss'
import { setConfetti } from './Overlay'

// Import all of Bootstrap's JS
import App from './App.svelte'

// const addSegmentButton = $<HTMLButtonElement>('#add-segment')

// const signInButton = $<HTMLButtonElement>('#sign-in-button')

// signInButton

const preview = $('#preview-container')
preview.width(window.innerWidth / 2)
preview.height(window.innerHeight / 2)

// addSegmentButton.on('click', () => {
//   const segment = $<HTMLDivElement>('#segment-template').clone()
//   segment.removeAttr('id')
//   segment.appendTo('#segments')
//   // updateInputs()
// })

const wheel = new Wheel(preview.width(), preview.height())
window.wheel = wheel
const wheelCanvas = $('#wheel')!
setConfetti(preview.width(), preview.height())
wheelCanvas.on('click', () => {
  wheel.spin()
})
const app = new App({
  target: document.getElementById('app'),
})

export default app
// function updateInputs() {
//   const inputs = $('.segment-input')
//   // inputs.forEach((input) => {
//   //   input.addEventListener('change', (event) => {
//   //     const target = event.target as HTMLInputElement
//   //     const value = target.value
//   //     const name = target.name
//   //     wheel.setOption(name, value)
//   //   })
//   // })
// }

// $('#copy-url-button').on('click', function () {
//   $('#copy-url-button').siblings('input').trigger('select')
//   document.execCommand('copy')
// })
