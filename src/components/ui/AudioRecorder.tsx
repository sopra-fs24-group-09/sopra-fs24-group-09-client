import WaveSurfer from "wavesurfer.js";
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { audioBuffer2wavBlob } from "helpers/audioUtilities";


const AudioRecorder: React.FC = () => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const recorder = useRef<RecordPlugin | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  
  // initialize wavesurfer
  const initializeWaveSurferWithRecorder = () => {
    if (wavesurfer.current) {
      console.log('wavesurfer already initialized')
      return;
    }
    if (waveformRef.current) {
      console.log('initializeWaveSurfer')
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "violet",
        progressColor: "purple",
        cursorColor: "white",
        height: 200,
      });
    }

    // TODO: make it a prop parameter of the component
    const cachedAudioBase64 = localStorage.getItem('audio');
    if (cachedAudioBase64) {
      console.log('load cached audio')
      wavesurfer.current?.load(cachedAudioBase64);
    }

    recorder.current = wavesurfer.current?.registerPlugin(RecordPlugin.create());
    recorder.current?.on('record-end',(blob: Blob) => {
      console.warn('record-end', blob);
      const container = waveformRef.current;
      const url = URL.createObjectURL(blob);
      // save audio to local storage as encoded base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        localStorage.setItem('audio', base64data);
      }
      reader.readAsDataURL(blob);
    });
  };

  const onClickRecord = () => {
    // stop recording
    if (recorder.current?.isRecording()) {
      console.log('stop recording')
      recorder.current?.stopRecording();
      setIsRecording(false);
      return;
    }
    console.log('start recording')
    // get microphone access
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
      recorder.current?.startRecording();
      setIsRecording(true);
    });
  };

  const onClickReverse = async() => {
    const audioBase64 = localStorage.getItem('audio');
    // set context's sample rate to 8000 to reduce the size of the reversed audio
    const context = new AudioContext();

    if (audioBase64){
      const buffer = await context.decodeAudioData(new Uint8Array(atob(audioBase64.split(',')[1]).split('').map(c => c.charCodeAt(0))).buffer);
      const offlineContext = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      const reversedBuffer = offlineContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const source = buffer.getChannelData(channel);
        const dest = reversedBuffer.getChannelData(channel);
        dest.set(source.reverse());
      }
      // render reversed audio
      const reversedAudio = offlineContext.createBufferSource();
      reversedAudio.buffer = reversedBuffer;
      reversedAudio.connect(offlineContext.destination);
      reversedAudio.start(0);
      offlineContext.startRendering().then(renderedBuffer => {
        const wavBlob = audioBuffer2wavBlob(renderedBuffer);
        console.log('reversed audio', wavBlob);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          try {
            localStorage.setItem('audioReversed', base64data);
            wavesurfer.current?.load(base64data);
          } catch (error) {
            console.error('Failed to save reversed audio to local storage', error);            
          }
        }
        reader.readAsDataURL(wavBlob);
        
      });

    }
  }


  // load audio
  useEffect(() => {
    initializeWaveSurferWithRecorder();
  }, []);
  
  
  return (
    <div>
      <h1>Audio Recorder</h1>
      <div ref={waveformRef} style={{ width: "100%", height: "200px" }}></div>
      <Button 
        disabled={isRecording}
        onClick={() => wavesurfer.current?.playPause()}>
          Play/Pause
      </Button>
      <Button onClick={onClickRecord}>Record</Button>
      <Button onClick={onClickReverse}>Reverse</Button>
    </div>
  )
};

export default AudioRecorder;