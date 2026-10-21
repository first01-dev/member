// file = Html5QrcodePlugin.jsx
import { Html5QrcodeScanner, Html5QrcodeCameraScanConfig } from 'html5-qrcode'
import { useEffect } from 'react'

const qrcodeRegionId = 'html5qr-code-full-region'

const createConfig = (props: any) => {
  let config: Html5QrcodeCameraScanConfig = {
    fps: 10,
    qrbox: 100,
    aspectRatio: 1.777778,
    videoConstraints: {
      facingMode: 'environment',
    },
  }
  if (props.fps) {
    config.fps = props.fps
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip
  }
  return config
}

const Html5QrcodePlugin = (props: any) => {
  useEffect(() => {
    const config = createConfig(props)
    const verbose = props.verbose === true
    if (!props.qrCodeSuccessCallback) {
      throw 'qrCodeSuccessCallback is required callback.'
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose,
    )
    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback,
    )

    return () => {
      html5QrcodeScanner.clear().catch(() => {})
    }
  }, [])

  return <div id={qrcodeRegionId} />
}

export default Html5QrcodePlugin
