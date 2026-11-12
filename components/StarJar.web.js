import React, { createElement as h, useCallback, useEffect, useRef, useState } from 'react';
import { Image, View } from 'react-native';
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

const uri = (asset) => Image.resolveAssetSource(asset)?.uri || '';

let cssInjected = false;
const injectCss = () => {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const el = document.createElement('style');
  el.id = 'star-jar-css';
  el.textContent = STAR_JAR_CSS;
  document.head.appendChild(el);
};

const img = (source, className, key) =>
  h('img', { key, src: uri(source), className: className || undefined, alt: '', draggable: false });

const preferWebpLoop = () => {
  if (typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const safari = /safari/i.test(ua) && !/chrome|chromium|android|crios|fxios/i.test(ua);
  if (iOS || safari) return true;
  try {
    return document.createElement('video').canPlayType('video/webm; codecs="vp9"') === '';
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
    const done = () => {
      if (live) setReady(true);
    };
    Promise.all(
      LAYER_ASSETS.map((asset) => {
        const u = uri(asset);
        if (!u) return Promise.resolve();
        if (Image.prefetch) return Image.prefetch(u).catch(() => {});
        return new Promise((resolve) => {
          const el = document.createElement('img');
          el.onload = resolve;
          el.onerror = resolve;
          el.src = u;
        });
      })
    ).then(done);
    const t = setTimeout(done, 600);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (variant !== 'loop') return undefined;
    const kick = () => setLoopReady(true);
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(kick, { timeout: 1200 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(kick, 50);
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
    if (heroEl) heroEl.addEventListener('animationend', finish, { once: true });
    else setTimeout(finish, 1050);
  }, [onPeak, onPopEnd]);

  useEffect(() => {
    if (!interactive || !autoPopEvery || !ready) return undefined;
    const id = setInterval(pop, autoPopEvery);
    return () => clearInterval(id);
  }, [interactive, autoPopEvery, ready, pop]);

  const host = { width: size, height: size, overflow: 'visible', ...(style || {}) };
  const box = {
    width: cssSize(size),
    height: cssSize(size),
    overflow: 'visible',
    position: 'relative',
  };
  const wrap = (child) => h(View, { style: host, children: child });

  const onKeyDown = (e) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pop();
    }
  };

  if (variant === 'static' || !ready) {
    return wrap(h('div', { className: 'sj-static', style: box, children: img(full, undefined, 'full') }));
  }

  if (variant === 'loop') {
    if (!loopReady) {
      return wrap(h('div', { className: 'sj-static', style: box, children: img(full, undefined, 'full') }));
    }
    if (webpLoop) {
      return wrap(
        h('div', {
          className: 'sj-loop',
          style: box,
          'aria-hidden': 'true',
          children: h('img', { src: '/star-jar/anim/jar-loop-320.webp', alt: '' }),
        })
      );
    }
    return wrap(
      h('div', {
        className: 'sj-loop',
        style: box,
        'aria-hidden': 'true',
        children: h('video', {
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          src: '/star-jar/anim/jar-loop.webm',
        }),
      })
    );
  }

  return wrap(
    h('div', {
      ref: (n) => {
        rootRef.current = n;
      },
      className: `sj sj-idle${interactive ? ' sj-interactive' : ''}`,
      style: box,
      role: interactive ? 'button' : 'img',
      tabIndex: interactive ? 0 : undefined,
      'aria-label': ariaLabel,
      onClick: interactive ? pop : undefined,
      onKeyDown,
      children: [
        h('div', {
          key: 'body',
          className: 'body',
          children: [
            img(glassBack, undefined, 'back'),
            img(stars, 'stars', 'stars'),
            img(glassFront, undefined, 'front'),
          ],
        }),
        img(lid, 'lid', 'lid'),
        img(hero, 'hero', 'hero'),
        img(spark, 'spark', 'spark'),
        h('span', { key: 's1', className: 'sparkle s1' }),
        h('span', { key: 's2', className: 'sparkle s2' }),
        h('span', { key: 's3', className: 'sparkle s3' }),
      ],
    })
  );
};

export default StarJar;
export const JAR_MOUTH = { x: 51.98, y: 37.02 };
