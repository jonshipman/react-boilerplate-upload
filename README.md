# react-boilerplate-upload

> Upload component for use with my boilerplate

[![NPM](https://img.shields.io/npm/v/react-boilerplate-upload.svg)](https://www.npmjs.com/package/react-boilerplate-upload) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
yarn add https://github.com/jonshipman/react-boilerplate-upload
```

## Usage

```jsx
import React from 'react'
import Upload from 'react-boilerplate-upload'

const Example = () => {
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
  );
}
```

## License

MIT © [jonshipman](https://github.com/jonshipman)
