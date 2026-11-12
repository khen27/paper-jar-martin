import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from 'react-native';
import { STAR_JAR_CSS } from './starJarCss';

const full = require('../assets/star-jar/layers-webp/00-full.webp');
const glassBack = require('../assets/star-jar/layers-webp/01-glass-back.webp');
const stars = require('../assets/star-jar/layers-webp/02-stars.webp');
const glassFront = require('../assets/star-jar/layers-webp/03-glass-front.webp');
const lid = require('../assets/star-jar/layers-webp/04-lid.webp');
const hero = require('../assets/star-jar/layers-webp/05-hero-star.webp');
const spark = require('../assets/star-jar/layers-webp/06-spark-star.webp');
const sparkle = require('../assets/star-jar/sparkle.webp');

const LAYER_ASSETS = [full, glassBack, stars, glassFront, lid, hero, spark, sparkle];

const uri = (asset) => {
  const resolved = Image.resolveAssetSource(asset);
  return resolved?.uri || '';
};

let cssInjected = false;
const injectCss = () => {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const el = document.createElement('style');
  el.id = 'star-jar-css';
  el.textContent = STAR_JAR_CSS;
  document.head.appendChild(el);
};

const preload = () =>
  Promise.all(
    LAYER_ASSETS.map(
      (asset) =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = uri(asset);
        })
    )
  );

const preferWebpLoop = () => {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const safari = /safari/i.test(ua) && !/chrome|chromium|android|crios|fxios/i.test(ua);
  if (iOS || safari) return true;
  try {
    const v = document.createElement('video');
    return v.canPlayType('video/webm; codecs="vp9"') === '';
  } catch (e) {
    return true;
  }
};

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cssSize = (size) => (typeof size === 'number' ? `${size}px` : size || '200px');

const StarJar = ({
  size = 200,
  interactive = false,
  autoPopEvery,
  onPeak,
  onPopEnd,
  variant = 'layered',
  ariaLabel = 'Pull a card',
  style,
}) => {
  const rootRef = useRef(null);
  const popping = useRef(false);
  const [ready, setReady] = useState(false);
  const [loopReady, setLoopReady] = useState(false);
  const [webpLoop] = useState(preferWebpLoop);

  useEffect(() => {
    injectCss();
    let live = true;
    preload().then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (variant !== 'loop') return undefined;
    let id = 0;
    const kick = () => setLoopReady(true);
    if (typeof requestIdleCallback === 'function') {
      id = requestIdleCallback(kick, { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    id = setTimeout(kick, 50);
    return () => clearTimeout(id);
  }, [variant]);

  const pop = useCallback(() => {
    const node = rootRef.current;
    if (!node || popping.current) return;
    if (reducedMotion()) {
      popping.current = true;
      node.classList.add('pop');
      onPeak && onPeak();
      setTimeout(() => {
        node.classList.remove('pop');
        popping.current = false;
        onPopEnd && onPopEnd();
      }, 350);
      return;
    }
    popping.current = true;
    node.classList.add('pop');
    const peakTimer = setTimeout(() => onPeak && onPeak(), 470);
    const heroEl = node.querySelector('.hero');
    const finish = () => {
      clearTimeout(peakTimer);
      node.classList.remove('pop');
      popping.current = false;
      onPopEnd && onPopEnd();
    };
    if (heroEl) {
      heroEl.addEventListener('animationend', finish, { once: true });
    } else {
      setTimeout(finish, 1050);
    }
  }, [onPeak, onPopEnd]);

  useEffect(() => {
    if (!interactive || !autoPopEvery || !ready) return undefined;
    const id = setInterval(pop, autoPopEvery);
    return () => clearInterval(id);
  }, [interactive, autoPopEvery, ready, pop]);

  const sizeStyle = { '--sj-size': cssSize(size), '--sj-sparkle': `url(${uri(sparkle)})` };
  const wrapStyle = { overflow: 'visible', ...(style || {}) };

  if (variant === 'static' || !ready) {
    return (
      <div className="sj-static" style={{ ...sizeStyle, ...wrapStyle }}>
        <img src={uri(full)} alt="" />
      </div>
    );
  }

  if (variant === 'loop') {
    const fallback = (
      <div className="sj-static" style={{ ...sizeStyle, ...wrapStyle }}>
        <img src={uri(full)} alt="" />
      </div>
    );
    if (!loopReady) return fallback;
    return (
      <div className="sj-loop" style={{ ...sizeStyle, ...wrapStyle }} aria-hidden="true">
        {webpLoop ? (
          <img src="/star-jar/anim/jar-loop-320.webp" alt="" />
        ) : (
          <video autoPlay loop muted playsInline src="/star-jar/anim/jar-loop.webm" />
        )}
      </div>
    );
  }

  const onKeyDown = (e) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pop();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`sj sj-idle${interactive ? ' sj-interactive' : ''}`}
      style={{ ...sizeStyle, ...wrapStyle }}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={interactive ? pop : undefined}
      onKeyDown={onKeyDown}
    >
      <div className="body">
        <img src={uri(glassBack)} alt="" />
        <img className="stars" src={uri(stars)} alt="" />
        <img src={uri(glassFront)} alt="" />
      </div>
      <img className="lid" src={uri(lid)} alt="" />
      <img className="hero" src={uri(hero)} alt="" />
      <img className="spark" src={uri(spark)} alt="" />
      <span className="sparkle s1" />
      <span className="sparkle s2" />
      <span className="sparkle s3" />
    </div>
  );
};

export default StarJar;
export const JAR_MOUTH = { x: 51.98, y: 37.02 };
