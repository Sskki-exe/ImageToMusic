// Function to handle image file selection
function handleImageFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  // Set up the onload event handler
  reader.onload = function (event) {
    changePElementsDisplay()
    var img = new Image();
    img.onload = function () {
      
      img = resizeImage(img);
      // Canvas element to draw the image
      const canvas = document.getElementById("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image on the canvas
      context.drawImage(img, 0, 0);

      // Get the pixel data from the canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Process the pixels as an array
      processPixels(pixels, canvas.width, canvas.height);
    };

    // Set the source of the image to the loaded file
    img.src = event.target.result;
  };

  // Read the file as a data URL
  reader.readAsDataURL(file);
}

function changePElementsDisplay() {
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach((p) => {
    p.style.display = 'block';
  });
}

function resizeImage(inputImage) {
  targetWidth = 600;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Calculate the aspect ratio of the input image
  const aspectRatio = inputImage.width / inputImage.height;

  // Calculate the target height based on the target width and aspect ratio
  const targetHeight = targetWidth / aspectRatio;

  // Set the canvas dimensions to the target width and height
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw the input image onto the canvas with the desired dimensions
  ctx.drawImage(inputImage, 0, 0, targetWidth, targetHeight);

  // Create a new image object with the resized dimensions
  const resizedImage = new Image();
  resizedImage.src = canvas.toDataURL();

  return resizedImage;
}


// Function to process the pixels array
function processPixels(pixels, width, height) {
  // Store pixels as array
  const pixelArray = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    pixelArray.push([r, g, b]);
  }

  // Usage
  const k = 12; // Number of clusters (desired colors in the palette)
  const maxIterations = 100; // Maximum number of iterations
  const [colorPalette, centroidIdx] = kMeansClustering(pixelArray, k, maxIterations);

  for (let i = 0; i < pixelArray.length; i += 1) {
    pixelArray[i] = colorPalette[centroidIdx[i]];
  }

  displayCanvas(pixelArray, width, height);
  let noteList = drawColorSquares(colorPalette, width, centroidIdx, height);
  console.log(noteList)

  playNotesSequentiallyAndTogether(noteList);
  extractedNotes = noteList;
  document.getElementById("outputText").innerHTML = extractedNotes;
}

const activeOscillators = [];

function playNote(note, startTime, duration) {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine'; // Set oscillator type to "sine" for a piano-like sound
  oscillator.frequency.value = noteToFrequency(note);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(startTime);
  gainNode.gain.setValueAtTime(0.3, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
  oscillator.stop(startTime + duration);
  activeOscillators.push(oscillator);
}

function stopAllOscillators() {
  activeOscillators.forEach(oscillator => oscillator.stop());
  activeOscillators.length = 0;
}

// Function to convert note name to frequency
function noteToFrequency(note) {
  const noteFrequency = {
    'C': 261.63,
    'C#': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'B': 493.88
  };

  return noteFrequency[note];
}

// Function to play the notes in order and then all together
function playNotesSequentiallyAndTogether(notes) {
  stopAllOscillators();
  const audioContext = new AudioContext();
  const startTime = audioContext.currentTime;

  // Play the notes in order with a delay between each note
  notes.forEach((note, index) => {
    const delay = index * 0.5; // Adjust the delay as needed
    const noteStartTime = startTime + delay;
    playNote(note, noteStartTime, 0.5);
  });

  // Play all notes together after the sequential play
  const allTogetherDelay = notes.length * .5; // Adjust the delay as needed
  const allTogetherStartTime = startTime + allTogetherDelay;
  notes.forEach(note => {
    playNote(note, allTogetherStartTime, .8);
  });
}


function sortArraysByValues(arr1, arr2) {
  // Create an array of index-value pairs from arr1
  const pairs = arr1.map((value, index) => ({
    value,
    index
  }));

  // Sort the pairs based on the values
  pairs.sort((a, b) => a.value - b.value);

  // Rearrange both arrays using the sorted indices
  const sortedArr1 = pairs.map(pair => arr1[pair.index]);
  const sortedArr2 = pairs.map(pair => arr2[pair.index]);

  return [sortedArr1, sortedArr2];
}

function mapHueToNote(hue) {
  // Map hue ranges to piano notes
  const noteMapping = [{
      note: 'C',
      minHue: 0,
      maxHue: 30
    },
    {
      note: 'C#',
      minHue: 30,
      maxHue: 45
    },
    {
      note: 'D',
      minHue: 45,
      maxHue: 75
    },
    {
      note: 'D#',
      minHue: 75,
      maxHue: 90
    },
    {
      note: 'E',
      minHue: 90,
      maxHue: 120
    },
    {
      note: 'F',
      minHue: 120,
      maxHue: 150
    },
    {
      note: 'F#',
      minHue: 150,
      maxHue: 165
    },
    {
      note: 'G',
      minHue: 165,
      maxHue: 195
    },
    {
      note: 'G#',
      minHue: 195,
      maxHue: 210
    },
    {
      note: 'A',
      minHue: 210,
      maxHue: 240
    },
    {
      note: 'A#',
      minHue: 240,
      maxHue: 255
    },
    {
      note: 'B',
      minHue: 255,
      maxHue: 285
    },
    {
      note: 'C',
      minHue: 285,
      maxHue: 315
    },
    {
      note: 'C#',
      minHue: 315,
      maxHue: 330
    },
    {
      note: 'D',
      minHue: 330,
      maxHue: 360
    }
  ];

  // Find the matching note for the given hue
  const matchingNote = noteMapping.find(mapping => hue >= mapping.minHue && hue < mapping.maxHue);

  if (matchingNote) {
    return matchingNote.note;
  } else {
    return null; // No matching note found for the given hue
  }
}

function sortMusicNotes(notes) {
  const noteOrder = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];

  notes.sort((a, b) => {
    const noteA = a.replace(/[#b]/, '');
    const noteB = b.replace(/[#b]/, '');
    const indexA = noteOrder.indexOf(noteA);
    const indexB = noteOrder.indexOf(noteB);

    if (indexA < indexB) {
      return -1;
    } else if (indexA > indexB) {
      return 1;
    } else {
      // If the note names are the same, compare the presence of sharps
      const sharpA = a.includes('#');
      const sharpB = b.includes('#');

      if (sharpA && !sharpB) {
        return 1;
      } else if (!sharpA && sharpB) {
        return -1;
      } else {
        return 0;
      }
    }
  });

  return notes;
}


function getHueFromRGB(red, green, blue) {
  // Normalize RGB values
  const normalizedRed = red / 255;
  const normalizedGreen = green / 255;
  const normalizedBlue = blue / 255;

  // Find the maximum and minimum values among the normalized RGB components
  const max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  const min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);

  // Calculate the difference and sum of the maximum and minimum values
  const difference = max - min;
  const sum = max + min;

  let hue = 0;

  if (difference === 0) {
    hue = 0; // Hue is 0 if the difference is 0 (gray color)
  } else if (max === normalizedRed) {
    hue = (60 * ((normalizedGreen - normalizedBlue) / difference) + 360) % 360;
  } else if (max === normalizedGreen) {
    hue = (60 * ((normalizedBlue - normalizedRed) / difference) + 120) % 360;
  } else if (max === normalizedBlue) {
    hue = (60 * ((normalizedRed - normalizedGreen) / difference) + 240) % 360;
  }

  return hue;
}

function drawColorSquares(rgbArray, canvasWidth, clusterIndices, height) {
  // Create a canvas element
  const canvas = document.getElementById('canvas3');
  const ctx = canvas.getContext("2d");

  var clusterCounts = new Array(rgbArray.length).fill(0);
  // Count the number of elements in each cluster
  for (let i = 0; i < clusterIndices.length; i++) {
    const clusterIndex = clusterIndices[i];
    clusterCounts[clusterIndex]++;
  }

  const maxValue = Math.max(...clusterCounts.filter(value => typeof value === 'number'));

  // Calculate the width of each square based on the canvas width
  const squareWidth = canvasWidth / 12;

  // Set the canvas dimensions
  canvas.width = canvasWidth;
  canvas.height = height;
  let noteList = [];
  // Loop through the RGB values and draw colored squares
  for (let i = 0; i < rgbArray.length; i++) {
    const color = rgbArray[i];
    const x = i * squareWidth;
    let hue = getHueFromRGB(color[0], color[1], color[2]);
    let note = mapHueToNote(hue);
    noteList.push(note);

    // Set the fill style to the RGB color value
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    // Draw a colored square at the specified position
    let w = squareWidth;
    let h = mapRange(clusterCounts[i], maxValue, height);
    ctx.fillRect(x, 0, w, h);

    // Label with corresponding note
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(note, x + w / 2, h - 5);
  }

  // Return the canvas element

  return sortMusicNotes(getUniqueValues(noteList));
}

function getUniqueValues(inputArray) {
  const uniqueSet = new Set(inputArray);
  const uniqueArray = Array.from(uniqueSet);

  return uniqueArray;
}

function displayCanvas(pixelArray, width, height) {
  const canvas = document.getElementById("canvas2");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const imageData = context.createImageData(canvas.width, canvas.height);

  for (let i = 0; i < pixelArray.length; i++) {
    const pixel = pixelArray[i];
    const [r, g, b] = pixel;

    // Set the pixel values in the image data
    const dataIndex = i * 4;
    imageData.data[dataIndex] = r;
    imageData.data[dataIndex + 1] = g;
    imageData.data[dataIndex + 2] = b;
    imageData.data[dataIndex + 3] = 255;
  }

  // Put the reordered image data on the canvas
  context.putImageData(imageData, 0, 0);
}

function mapRange(value, max1, max2) {
  let min1 = 0;
  let min2 = 0;
  return ((value - min1) * (max2 - min2)) / (max1 - min1) + min2;
}

// Function to calculate the Euclidean distance between two RGB colors
function distance(color1, color2) {
  const rDiff = color1[0] - color2[0];
  const gDiff = color1[1] - color2[1];
  const bDiff = color1[2] - color2[2];
  return Math.sqrt(rDiff ** 2 + gDiff ** 2 + bDiff ** 2);
}

// Perform k-means clustering
function kMeansClustering(data, k, maxIterations) {
  // Initialize k random centroids
  let centroids = [];
  const clusterIndices = new Array(data.length);

  for (let i = 0; i < k; i++) {
    centroids.push(data[Math.floor(Math.random() * data.length)]);
  }

  // Main clustering loop
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign each data point to the closest centroid
    for (let i = 0; i < data.length; i++) {
      const pixel = data[i];
      let minDist = Infinity;
      let closestCentroidIndex = null;

      for (let j = 0; j < k; j++) {
        const centroid = centroids[j];
        const dist = distance(pixel, centroid);
        if (dist < minDist) {
          minDist = dist;
          closestCentroidIndex = j;
        }
      }

      clusterIndices[i] = closestCentroidIndex;
    }

    // Update centroids based on the mean of each cluster
    for (let i = 0; i < k; i++) {
      const clusterPixels = [];
      for (let j = 0; j < clusterIndices.length; j++) {
        if (clusterIndices[j] === i) {
          clusterPixels.push(data[j]);
        }
      }

      if (clusterPixels.length > 0) {
        const newCentroid = clusterPixels.reduce((acc, val) => {
          return [
            acc[0] + val[0],
            acc[1] + val[1],
            acc[2] + val[2]
          ];
        }, [0, 0, 0]).map(sum => Math.round(sum / clusterPixels.length));
        centroids[i] = newCentroid;
      }
    }
  }

  return [centroids, clusterIndices];
}




// Add event listener to the file input
const fileInput = document.getElementById("imageFileInput");
fileInput.addEventListener("change", handleImageFile);

var extractedNotes = [];
let activeNotes = [];

const playButton = document.getElementById('playButton');
playButton.addEventListener('click', () => {
  playNotesSequentiallyAndTogether(extractedNotes);
});
