const Jimp = require('jimp');

Jimp.read('src/assets/logo.jpg')
  .then(image => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // Threshold for black
      if (red < 35 && green < 35 && blue < 35) {
        this.bitmap.data[idx + 3] = 0; 
      }
    });
    return image.writeAsync('src/assets/logo.png');
  })
  .then(() => {
    console.log('Successfully created logo.png with transparent background');
  })
  .catch(err => {
    console.error('Error processing image:', err);
  });
