import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { Goback, PLayListSVG, PlussVG } from '../assets/svg/SVGs';
import { colors } from '../util/theme/theme';
import ItemList from '../ReusableComponent/ItemList';
import { addToPlayList, removeFromPlayList } from '../redux/actions/actions';
import AppModal from '../ReusableComponent/AppMOdal';
import ReuseButton from '../ReusableComponent/ReuseButton';

const PLayListDetailCOmponent = () => {
  const route = useRoute<any>();
  const { playlistName, playlistId } = route.params;
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const { PlayList, songs, deviceSong } = useAppSelector(state => state.songs);
  const currentPLayList: any = PlayList?.find((D: any) => D?.id === playlistId);

  const [addModalVisible, setAddModalVisible] = useState(false);

  //   useEffect(() => {
  //     console.log(currentPLayList);
  //   }, [playlistId, playlistName]);

  const allSongs = useMemo(
    () => [...(songs ?? []), ...(deviceSong ?? [])],
    [songs, deviceSong],
  );

  const songCount = currentPLayList?.songs?.length ?? 0;

  const isSongInPlaylist = (song: any) =>
    !!currentPLayList?.songs?.some((s: any) => s.id === song.id);

  const handleAddSong = (song: any) => {
    if (isSongInPlaylist(song)) return;
    dispatch(addToPlayList({ playListId: playlistId, song }));
  };

  const closeModal = () => setAddModalVisible(false);

  const handDeletSOng = (song: any) => {
    dispatch(removeFromPlayList({ playListId: playlistId, songId: song.id }));
  };

  useEffect(() => {
    console.log(playlistId);
  }, [playlistId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ReuseButton
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Goback fill={colors.primary} height={26} width={26} />
        </ReuseButton>
        <ReuseButton
          style={styles.addBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <PlussVG height={18} width={18} />
          <Text style={styles.addBtnText}>Add Song</Text>
        </ReuseButton>
      </View>
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <PLayListSVG color={colors.primary} height={50} width={50} />
        </View>
        <Text style={styles.playlistName} numberOfLines={1}>
          {currentPLayList?.name}
        </Text>
        <Text style={styles.songCount}>
          {songCount} song{songCount === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={styles.listWrapper}>
        {songCount > 0 ? (
          <ItemList
            data={currentPLayList.songs}
            keyExtractor={(item: any) => String(item.id)}
            getTitle={(item: any) => item.title}
            getSubtitle={(item: any) => item.artist}
            getArtwork={(item: any) => item.artwork}
            isSearch={false}
            showIndex={false}
            onDeleteItem={item => handDeletSOng(item)}
            onPressItem={(item, index) => {
              navigation.navigate('PlaySong', {
                songIndex: index,
                songId: item.id,
                source: 'playList',
                playlistId: playlistId,
              });
            }}
            Paddingbottom={30}
          />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No songs yet</Text>
            <ReuseButton
              style={styles.emptyAddBtn}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.emptyAddBtnText}>Add your first song</Text>
            </ReuseButton>
          </View>
        )}
      </View>
      <AppModal
        visible={addModalVisible}
        onClose={closeModal}
        variant="fullscreen"
      >
        <View style={styles.modalHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              Add Songs
            </Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>
              to "{currentPLayList?.name}"
            </Text>
          </View>
          <ReuseButton onPress={closeModal} style={styles.doneBtn}>
            <Text style={styles.doneText}>Done</Text>
          </ReuseButton>
        </View>
        <View style={styles.pickerListWrapper}>
          <ItemList
            data={allSongs}
            keyExtractor={(item: any) => String(item.id)}
            getTitle={(item: any) => item.title}
            getSubtitle={(item: any) => item.artist}
            getArtwork={(item: any) => item.artwork}
            showIndex={false}
            isAdded={isSongInPlaylist}
            onToggleAdd={(item: any) => handleAddSong(item)}
            Paddingbottom={20}
          />
        </View>
      </AppModal>
    </View>
  );
};

export default PLayListDetailCOmponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 32,
    borderRadius: 16,
    marginBottom: 14,
  },
  playlistName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  songCount: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  listWrapper: {
    flex: 1,
    marginTop: 10,
    // paddingEnd: 10,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyAddBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: 10,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: colors.primaryFaint,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  doneText: {
    color: colors.primaryLight,
    fontWeight: '700',
    fontSize: 14,
  },
  pickerListWrapper: {
    flex: 1,
  },
});
