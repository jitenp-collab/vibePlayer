import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const DefaultPlaceholder = require('../assets/images/placeholder-artwork.png');

const FallbackImage = ({
  uri,
  style,
  placeholder = DefaultPlaceholder,
}: {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  placeholder?: any;
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [uri]);

  const showRealImage = !!uri && !imageFailed;

  return (
    <Image
      source={showRealImage ? { uri } : placeholder}
      style={style}
      onError={() => setImageFailed(true)}
    />
  );
};

export default FallbackImage;