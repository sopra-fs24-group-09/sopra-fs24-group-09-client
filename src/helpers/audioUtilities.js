export const audioBuffer2wavBlob = (abuffer) => {
  console.log("[Debug] audioBuffer2wavBlob", abuffer);
  let blobs = [];
  // calc number of segments and segment length
  var channels = abuffer.numberOfChannels,
    duration = abuffer.duration,
    rate = abuffer.sampleRate,
    segmentLen = 3, // 3 seconds for each segment blob
    count = Math.floor(duration / segmentLen),
    remaining = duration % segmentLen,
    remainingBlock = Math.round(remaining * rate),
    offset = 0,
    block = segmentLen * rate;
  
  // write header only once
  let wavHeaderBlob = wavHeader(abuffer);
  blobs.push(wavHeaderBlob);
  // loop through the segments
  while (count--) {
    let blob = bufferToWave(abuffer, offset, block);
    // concatenate segments to single blob
    blobs.push(blob);
    offset += block;
  }
  // remaining block
  if (remaining > 0) {
    let blob = bufferToWave(abuffer, offset, remainingBlock);
    blobs.push(blob);
  }

  // return the blob
  const mergedBlob = new Blob(blobs, { type: "audio/wav" });
  return mergedBlob;
  

}

function wavHeader(abuffer) {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  let buffer = new ArrayBuffer(44),
    pos = 0,
    view = new DataView(buffer);
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // length = 16
  setUint16(1);                                  // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);                      // block-align
  setUint16(16);                                 // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                         // "data" - chunk
  setUint32(length - pos - 4);                   // chunk length

  // create Blob
  return new Blob([buffer], { type: "audio/wav" });

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
  

}

// Convert a audio-buffer segment to a Blob using WAVE representation
function bufferToWave(abuffer, offset, len) {

  var numOfChan = abuffer.numberOfChannels,
    length = len * numOfChan * 2,
    buffer = new ArrayBuffer(length),
    view = new DataView(buffer),
    channels = [], i, sample,
    pos = 0;
  
  // // write WAVE header
  // if( writeHeader ){
  //   console.log("Writing header");
  //   setUint32(0x46464952);                         // "RIFF"
  //   setUint32(length - 8);                         // file length - 8
  //   setUint32(0x45564157);                         // "WAVE"

  //   setUint32(0x20746d66);                         // "fmt " chunk
  //   setUint32(16);                                 // length = 16
  //   setUint16(1);                                  // PCM (uncompressed)
  //   setUint16(numOfChan);
  //   setUint32(abuffer.sampleRate);
  //   setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  //   setUint16(numOfChan * 2);                      // block-align
  //   setUint16(16);                                 // 16-bit (hardcoded in this demo)

  //   setUint32(0x61746164);                         // "data" - chunk
  //   setUint32(length - pos - 4);                   // chunk length
  // }
  // console.log(`after header: pos=${pos}, length=${length}`)
  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // update data chunk
      pos += 2;
    }
    offset++;                                     // next source sample in another channel
  }

  // create Blob
  return new Blob([buffer], { type: "audio/wav" });

  // function setUint16(data) {
  //   view.setUint16(pos, data, true);
  //   pos += 2;
  // }

  // function setUint32(data) {
  //   view.setUint32(pos, data, true);
  //   pos += 4;
  // }
}