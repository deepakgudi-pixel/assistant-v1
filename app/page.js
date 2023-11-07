"use client";
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './page.module.css';
import SplitType from "split-type";

const AudioAnimationComponent = () => {
  const audioElementRef = useRef(null);
  const animationElementRef = useRef(null);
  const buttonRef = useRef(null);
  const textToSpeechRef = useRef(null); 
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const createAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const audioSource = audioContextRef.current.createMediaElementSource(audioElementRef.current);
      audioSource.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
  };

  const playAudio = () => {
    createAudioContext(); 
    if (audioElementRef.current.paused) {
      audioElementRef.current.play();
      setIsAudioPlaying(true);
      fadeInAnimation(); 
      moveButtonUp(); 
    }
  };

  const stopAudio = () => {
    audioElementRef.current.pause();
    audioElementRef.current.currentTime = 0;
    setIsAudioPlaying(false);
    resetFadeInAnimation();
    resetButtonPosition(); 
  };

  const fadeInAnimation = () => {
    gsap.to(animationElementRef.current, {
      duration: 0.5, 
      opacity: 1,
    });
  };

  const resetFadeInAnimation = () => {
    gsap.set(animationElementRef.current, {
      opacity: 0, 
    });
  };

  const moveButtonUp = () => {
    gsap.to(buttonRef.current, {
      duration: 1,
      ease: 'power2.inOut',
      opacity: 0,
      top: '15%',
    });
  };

  const resetButtonPosition = () => {
    gsap.to(buttonRef.current, {
      duration: 0.5,
      top: '50%',
    });
  };

  useEffect(()=> {
    const text = new SplitType(textToSpeechRef.current); 

    const hideWord = textToSpeechRef.current.querySelectorAll('.word');

    gsap.set(hideWord, { opacity: 0 });

  }, [])


  const revealWords = () => {
    const words = textToSpeechRef.current.querySelectorAll('.word');

    words.forEach((word, index) => {
      gsap.to(word, {
        duration: 0.5,
        opacity: 1,
        delay: index * 0.3,
      });
    });
  };



  useEffect(() => {

    if (isAudioPlaying) {
      fadeInAnimation();

      const updateAnimation = () => {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const animationValue = dataArrayRef.current[0];
        const scale = 0.8 + (animationValue / 255 * 0.4);

        gsap.to(animationElementRef.current, {
          duration: 0.1,
          scale: scale,
        });

        revealWords();

        requestAnimationFrame(updateAnimation);
      };
  

      updateAnimation();
    } else {
      resetFadeInAnimation();
      resetButtonPosition();
    }
  }, [isAudioPlaying]);


  return (
    <main className={styles.main}>
      <audio ref={audioElementRef}>
        <source src="/audio/continental.wav" type="audio/wav"/>
      </audio>

      <div ref={buttonRef} onClick={isAudioPlaying ? stopAudio : playAudio} className={styles.title}>
        Get Started
      </div>

      <div ref={animationElementRef} className={styles.animatedElement}></div>

      <div ref={textToSpeechRef} className={styles.textToSpeech} >
      Welcome to Continental my name is Sarah. What brings you here in this wonderful day?
      </div>
    </main>
  );
};

export default AudioAnimationComponent;
