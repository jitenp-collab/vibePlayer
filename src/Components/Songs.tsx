import React from 'react';
import { songs } from '../assets/OfflineSongs';
import { useNavigation } from '@react-navigation/native';
import ItemList from '../ReusableComponent/ItemList';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite } from '../redux/actions/actions';
import { View } from 'react-native';

const Songs = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { favouriteSong } = useAppSelector(state => state.songs);

  return (
    <View>
      <ItemList
        data={songs}
        keyExtractor={item => item.id}
        getTitle={item => item.title}
        getSubtitle={item => item.artist}
        getArtwork={item => item.artwork}
        onPressItem={(item, index) =>
          navigation.navigate('PlaySong', { songIndex: index, songId: item.id })
        }
        isFavourite={item =>
          favouriteSong.some((fav: any) => fav.id === item.id)
        }
        onToggleFavourite={item => dispatch(AddFavourite(item))}
        Paddingbottom="100%"
      />
    </View>
  );
};

export default Songs;
