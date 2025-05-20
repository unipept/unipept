self.onmessage = async (event) => {
    const { imageUrl } = event.data;

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Send the object URL back to the main thread
    self.postMessage({blob});
};
