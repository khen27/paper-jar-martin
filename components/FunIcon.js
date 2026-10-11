import React from 'react';
import { Image } from 'react-native';

// 3D icons from Microsoft Fluent Emoji (MIT, see assets/icons3d/LICENSE).
const ICONS = {
  partner: require('../assets/icons3d/partner.png'),
  friend: require('../assets/icons3d/friend.png'),
  party: require('../assets/icons3d/party.png'),
  adult: require('../assets/icons3d/adult.png'),
  workout: require('../assets/icons3d/workout.png'),
  knowMe: require('../assets/icons3d/knowMe.png'),
  brnoPrague: require('../assets/icons3d/brnoPrague.png'),
  office: require('../assets/icons3d/office.png'),
  homePack: require('../assets/icons3d/homePack.png'),
  custom: require('../assets/icons3d/custom.png'),
  invite: require('../assets/icons3d/invite.png'),
  halloween: require('../assets/icons3d/halloween.png'),
  autumn: require('../assets/icons3d/autumn.png'),
  christmas: require('../assets/icons3d/christmas.png'),
  classic: require('../assets/icons3d/classic.png'),
  drinks: require('../assets/icons3d/drinks.png'),
  crown: require('../assets/icons3d/crown.png'),
  lock: require('../assets/icons3d/lock.png'),
  ad: require('../assets/icons3d/ad.png'),
  gift: require('../assets/icons3d/gift.png'),
  ghost: require('../assets/icons3d/ghost.png'),
  bat: require('../assets/icons3d/bat.png'),
  maple: require('../assets/icons3d/maple.png'),
  snowflake: require('../assets/icons3d/snowflake.png'),
  cheers: require('../assets/icons3d/cheers.png'),
  dice: require('../assets/icons3d/dice.png'),
  mute: require('../assets/icons3d/mute.png'),
  handshake: require('../assets/icons3d/handshake.png'),
  trophy: require('../assets/icons3d/trophy.png'),
  candle: require('../assets/icons3d/candle.png'),
  sparkles: require('../assets/icons3d/sparkles.png'),
  spider: require('../assets/icons3d/spider.png'),
  soft: require('../assets/icons3d/soft.png'),
  newyear: require('../assets/icons3d/newyear.png'),
};

export const hasFunIcon = (name) => !!ICONS[name];

const FunIcon = ({ name, size = 40, style }) => {
  const source = ICONS[name];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
};

export default FunIcon;
