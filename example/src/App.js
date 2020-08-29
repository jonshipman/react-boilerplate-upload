import React from 'react'

import Upload from 'react-boilerplate-upload'

const App = () => {
  return (
    <Upload
      onFailure={(file) => {
        console.error(file)
      }}
      onComplete={(file) => {
        console.log(file)
      }}
      label='Click Here to Upload a PDF Resume.'
      accept='application/pdf'
      previewAltImages={{
        'application/pdf': '/images/application-pdf.png'
      }}
      BACKEND_URL={'http://localhost/'}
    />
  )
}

export default App
