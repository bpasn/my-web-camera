import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { BoxContainer } from './StyleComponent'
import './App.css'
function App() {
  const photo = useRef(new Array())
  const video = useRef(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [openCamera, setOpenCamera] = useState(false)
  const [image, setImage] = useState('')
  const [result, setResult] = useState(null)

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const getVideo = () => {
    navigator.mediaDevices.getUserMedia({
      video: { width: 350, height: 200, },
    }).then(stream => {
      let v = video.current
      v.srcObject = stream
      openCamera ? v.play() : stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }).catch(err => console.log(err))
  }
  const getPhoto = async () => {
    document.getElementById('formFile').value = ''
    setLoading(true)
    const width = 414
    const height = width / (16 / 9)
    let v = video.current
    let p = photo.current
    p.width = width
    p.height = height
    let cxt = p.getContext('2d')
    let img = new Image()

    cxt.drawImage(v, 0, 0, width, height);
    let base64 = p.toDataURL('image/jpeg', 1.0).split(',')[1]
    img.src = p.toDataURL('image/jpeg', 1.0).split(',')
    img.onload = () => {
      cxt.drawImage(img, 0, 0, width, height)
    }
    setImage(p.toDataURL('image/jpeg', 1.0).split(','))
    const { data } = await axios.post(`/api`, {
      base: base64
    })

    if (data.status == 200) {
      console.log(data)
      setResult(data.result.detected_objects.map(e => e))
      handleOpenCamera()
      setError(null)
      setHasPhoto(true)
      setLoading(false)
    } else {
      console.log('this is error')
      setResult(null)
      setError({ "error": { message: 'error' } })
    }
  }
  const handleOpenCamera = () => {
    setOpenCamera(!openCamera)
  }
  const inputChange = (e) => {
    setLoading(true)
    var file = e.target.files[0];
    var reader = new FileReader();
    let img = new Image()
    const width = 414
    const height = width / (16 / 9)
    let p = photo.current
    p.width = width
    p.height = height
    let cxt = p.getContext('2d')
    reader.onloadend = async function (evt) {
      if (evt.target.readyState == FileReader.DONE) {
        const { data } = await axios.post('/api', { base: reader.result.split(',')[1] })
        if (data.status === 200) {
          console.log(data)
          setHasPhoto(true)
          img.src = evt.target.result;
          img.onload = () => cxt.drawImage(img, 0, 0, width, height);
          setResult(data.result.detected_objects.map(e => e))
          setImage(evt.target.result)
          setError(null)
          setLoading(false)
        } else {
          setResult(null)
          setLoading(false)
          setError(data.error)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  console.log(result)
  useEffect(() => {
    getVideo()
  }, [video, openCamera])

  return (
    <div className="container">
      <div className='d-flex flex-column p-5 m-2 '>
        <div className="camera" style={{ display: openCamera ? 'block' : 'none' }}>
          <video ref={video} />
        </div>
        <button className={`mt-1 btn btn-primary ${openCamera ? 'd-block' : 'd-none'}`} onClick={getPhoto} >Capture photo</button>
        <button className={`btn mt-2 ${openCamera ? 'btn-danger' : 'btn-info'}`} onClick={handleOpenCamera}>{openCamera ? 'close' : 'open camera'}</button>
        <div className="mb-3 mt-3">
          <input className="form-control" type="file" id="formFile" disabled={openCamera} onChange={(e) => inputChange(e)} />
        </div>
        <canvas ref={photo} style={{ display: 'none' }}></canvas>
        {error ? <>{error.message}</> : ''}
        {result ? result.map((item, ind) => {
          return (
            <div key={ind} className='mt-2'>
              <div className="d-flex justify-content-end align-items-center flex-wrap" style={{ position: 'relative' }}>
                <div className="canvas" style={{ position:'relative'}}>
                  <img src={image} alt="" style={{ width: '100%' }} />
                  {item.bounding_box && <BoxContainer top={item.bounding_box.top} left={item.bounding_box.left} right={item.bounding_box.right} bottom={item.bounding_box.bottom}/>} 
                </div>
                <div className={`detail ${hasPhoto ? 'd-block' : 'd-none'} `}>
                  <ul className='p-1'>
                    <li>name : {item.name ? item.name : '-'}</li>
                    <li>parent : {item.parent ? item.parent : '-'}</li>
                    <li>confidence : {item.confidence ? item.confidence : '-'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        })
          : loading ? <>.....Loading</> : ''}
      </div>

    </div>
  );
}

export default App;
