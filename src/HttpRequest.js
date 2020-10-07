export const HTTPRequest = ({
  file,
  progress,
  post,
  modifyRequest,
  BACKEND_URL,
  actionName = "media_upload",
}) => {
  const url = `${BACKEND_URL}/wp_boilerplate_upload_ajax?action=${actionName}`;

  return new Promise((res, rej) => {
    const request = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);

    Object.keys(post).forEach((key) => form.append(key, post[key]));

    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 400) {
          res(request.responseText);
        } else {
          rej(request.statusText);
        }
      }
    };

    request.open("post", url, true);
    request.upload.addEventListener("progress", progress);

    modifyRequest(request);
    // Pass in the prop "modifyRequest" to do something like below
    // if (Config.getAuthToken()) {
    //   request.setRequestHeader(
    //     "Authorization",
    //     "Bearer " + Config.getAuthToken()
    //   );
    // }

    request.send(form);
  });
};
