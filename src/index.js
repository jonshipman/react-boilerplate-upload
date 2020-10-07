import React, { useCallback, useReducer } from "react";
import { useDropzone } from "react-dropzone";

import { HTTPRequest } from "./HttpRequest";
import { isMobile } from "./functions";
import { Item } from "./Item";
import Loading from "./Loading";
import LoadingError from "./LoadingError";

const reducer = (state, incoming) => {
  incoming.timeLast = incoming.timeCurrent || new Date().getTime();
  incoming.timeCurrent = new Date().getTime();

  const files = [];

  var remove = false;
  if (!incoming.loading && 100 === incoming.progress) {
    remove = true;
  }

  if (!incoming.loading && 0 === incoming.progress) {
    remove = true;
  }

  if (state.length < 1) {
    if (!remove) {
      files.push(incoming);
    }
  } else {
    state.forEach((file) => {
      if (file.name === incoming.name) {
        if (!remove) {
          files.push(incoming);
        }
      } else {
        files.push(file);
      }
    });
  }

  return files;
};

const Upload = ({
  className = "",
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
  progressBarClassName = "bg-primary",
  actionName,
  post = {},
  ...props
}) => {
  const [files, setFile] = useReducer(reducer, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
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
          uploaded: 0,
        };

        reader.onabort = () => {
          const message = "file reading was aborted";
          const readerAbortFile = { ...f, loading: false, error: message };
          setFile(readerAbortFile);
          onFailure(readerAbortFile);
        };

        reader.onerror = () => {
          const message = "file reading has failed";
          const readerErrorFile = { ...f, loading: false, error: message };
          setFile(readerErrorFile);
          onFailure(readerErrorFile);
        };

        reader.onload = () => {
          f.binary = reader.result;

          const progress = (evt) => {
            const p =
              ((evt.position || evt.loaded) / (evt.totalSize || evt.total)) *
              100;

            const progressFile = {
              ...f,
              uploaded: evt.loaded || evt.position,
              progress: Math.round(p),
            };
            setFile(progressFile);
            onProgress(progressFile);
          };

          const complete = (response) => {
            let c = onComplete;
            const completeFile = { ...f, loading: false, response };

            if ("" === response || "0" === response) {
              c = onFailure;
              completeFile.error = "Unable to save.";
            }

            setFile(completeFile);
            c(completeFile);
          };

          const error = (message) => {
            const errorFile = { ...f, loading: false, error: message };
            setFile(errorFile);
            onFailure(errorFile);
          };

          onStart(f);
          setFile(f);

          HTTPRequest({
            file,
            progress,
            post,
            modifyRequest,
            BACKEND_URL,
            actionName,
          })
            .then((result) => complete(result))
            .catch((message) => error(message));
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [
      onStart,
      onComplete,
      onProgress,
      onFailure,
      post,
      modifyRequest,
      BACKEND_URL,
      actionName,
    ],
  );

  const dropzoneAttrs = {
    onDrop,
    multiple,
    canCancel: true,
  };

  if (accept) {
    dropzoneAttrs.accept = accept;
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone(
    dropzoneAttrs,
  );

  const rootProps = getRootProps({
    className: `bg-near-white ba b--moon-gray pa2 moon-gray f6 mb3 relative z-1 pointer tc overflow-hidden ${className}`,
  });

  return (
    <div {...rootProps} {...props}>
      <input {...getInputProps()} />
      {_mobile() ? (
        <p>Tap to select files</p>
      ) : isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
      {files.length > 0 &&
        files.map((file) => (
          <Item
            key={file.name}
            {...{
              file,
              progressBarClassName,
              loadingErrorComponent,
              loadingComponent,
              previewAltImages,
            }}
          />
        ))}
    </div>
  );
};

export default Upload;
