import React, { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

import { isMobile } from './functions'
import Loading from './Loading'
import LoadingError from './LoadingError'

const calcTimeLeft = (file) => {
  const ttd = file.timeCurrent - file.timeStarted
  const uploadSpeed = file.uploaded / (ttd / 1000)

  if (uploadSpeed > 0) {
    const tl = Math.round((file.size - file.uploaded) / uploadSpeed)
    return new Date(tl * 1000).toISOString().substr(11, 8)
  }

  return 0
}

const Item = ({
  file,
  loadingComponent: Load,
  loadingErrorComponent: Error,
  previewAltImages = {}
}) => {
  const [className, setClassname] = useState('bg-moon-gray')

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (!file.loading) {
        setClassname('bg-white')
      }
    }, 2500)

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [setClassname, file])

  const timeLeft = calcTimeLeft(file)

  let preview = file.preview

  // Allows the developer to specify alternative images, like a PDF or DOC thumbnail icon
  Object.keys(previewAltImages).forEach((key) => {
    if (key === file.type) {
      preview = previewAltImages[key]
    }
  })

  return (
    <div
      className={`bg-animate relative z-1 flex flex-wrap flex-nowrap-l items-center ${className}`}
    >
      <div
        className='w3 h3 bg-center cover relative z-2 ma2 bg-gray'
        style={{ backgroundImage: `url(${preview})` }}
      />
      <div className='black relative z-2'>{file.name}</div>
      {file.loading && file.progress > 99 && (
        <div className='relative z-2 ma2'>
          <Load color='#fff' />
        </div>
      )}
      {file.error && (
        <div className='relative z-2 ma2 black'>
          <Error error={file.error} />
        </div>
      )}
      {!file.loading && !file.error && (
        <div className='relative z-2 mt2 mr2 mb2 white ml-auto'>Done!</div>
      )}
      {timeLeft && (
        <div className='black ma2 relative z-2 ml-auto'>
          {timeLeft} remaining
        </div>
      )}
      {(file.loading || file.error) && (
        <div
          className={`absolute z-1 top-0 bottom-0 left-0 w-100 ${
            file.error ? 'bg-red' : 'bg-primary'
          }`}
          style={{ width: `${file.progress}%` }}
        />
      )}
    </div>
  )
}

const HTTPRequest = ({ file, progress, post, modifyRequest, BACKEND_URL }) => {
  const url = `${BACKEND_URL}/wp-admin/admin-ajax.php?action=media_upload`

  return new Promise((res, rej) => {
    const request = new XMLHttpRequest()
    const form = new FormData()
    form.append('file', file)

    Object.keys(post).forEach((key) => form.append(key, post[key]))

    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 400) {
          res(request.responseText)
        } else {
          rej(request.statusText)
        }
      }
    }

    request.open('post', url, true)
    request.upload.addEventListener('progress', progress)

    modifyRequest(request)
    // Pass in the prop "modifyRequest" to do something like below
    // if (Config.getAuthToken()) {
    //   request.setRequestHeader(
    //     "Authorization",
    //     "Bearer " + Config.getAuthToken()
    //   );
    // }

    request.send(form)
  })
}

const Upload = ({
  className = '',
  multiple = false,
  onStart = () => {},
  onProgress = () => {},
  onComplete = () => {},
  onFailure = () => {},
  modifyRequest = () => {},
  isMobile: _mobile = isMobile,
  BACKEND_URL,
  accept,
  loadingComponent = Loading,
  loadingErrorComponent = LoadingError,
  previewAltImages,
  post = {},
  ...props
}) => {
  const [files, setFiles] = useState([])

  const stateManagement = useCallback(
    (name, args, callback = () => {}) => {
      setFiles((prev) => {
        let _file = prev.filter((i) => i.name === name)
        let _files = prev.filter((i) => i.name !== name)
        let _f = {}

        if (_file?.length > 0) {
          _f = { ..._file[0], ...args }
        } else {
          _f = args
        }

        _f.timeLast = _f.timeCurrent
        _f.timeCurrent = new Date().getTime()

        if (!_f.loading && 100 === _f.progress) {
          _file = []
        } else {
          _file = [_f]
        }

        // The timeout is to prevent two simultaneous renders in separate components.
        setTimeout(() => {
          callback(_f)
        })

        if (multiple) {
          return [..._files, ..._file]
        } else {
          return _file
        }
      })
    },
    [setFiles, multiple]
  )

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader()
        const f = {
          error: null,
          binary: null,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file),
          progress: 0,
          loading: true,
          timeStarted: new Date().getTime(),
          timeLast: new Date().getTime(),
          timeCurrent: new Date().getTime(),
          uploaded: 0
        }

        reader.onabort = () => {
          const message = 'file reading was aborted'
          stateManagement(f.name, { loading: false, error: message }, onFailure)
        }

        reader.onerror = () => {
          const message = 'file reading has failed'
          stateManagement(f.name, { loading: false, error: message }, onFailure)
        }

        reader.onload = () => {
          f.binary = reader.result

          const progress = (evt) => {
            const p =
              ((evt.position || evt.loaded) / (evt.totalSize || evt.total)) *
              100

            stateManagement(
              f.name,
              { uploaded: evt.loaded || evt.position, progress: Math.round(p) },
              onProgress
            )
          }

          const complete = (response) => {
            let c = onComplete
            const params = { loading: false, response }

            if ('' === response || '0' === response) {
              c = onFailure
              params.error = 'Unable to save.'
            }

            stateManagement(f.name, params, c)
          }

          const error = (message) => {
            stateManagement(
              f.name,
              { loading: false, error: message },
              onFailure
            )
          }

          stateManagement(f.name, f, onStart)

          HTTPRequest({ file, progress, post, modifyRequest, BACKEND_URL })
            .then((result) => complete(result))
            .catch((message) => error(message))
        }

        reader.readAsArrayBuffer(file)
      })
    },
    [
      stateManagement,
      onStart,
      onComplete,
      onProgress,
      onFailure,
      post,
      modifyRequest,
      BACKEND_URL
    ]
  )

  const dropzoneAttrs = {
    onDrop,
    multiple,
    canCancel: true
  }

  if (accept) {
    dropzoneAttrs.accept = accept
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone(
    dropzoneAttrs
  )

  return (
    <div
      {...getRootProps({
        className: `bg-near-white ba b--moon-gray pa2 moon-gray f6 mb3 relative z-1 pointer tc overflow-hidden ${className}`
      })}
      {...props}
    >
      <input {...getInputProps()} />
      {_mobile() ? (
        <p>Tap to select files</p>
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
      {files.length > 0 &&
        files.map((f) => (
          <Item
            key={f.name}
            file={f}
            loadingErrorComponent={loadingErrorComponent}
            loadingComponent={loadingComponent}
            previewAltImages={previewAltImages}
          />
        ))}
    </div>
  )
}

export default Upload
