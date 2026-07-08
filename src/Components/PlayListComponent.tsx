import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { PlussVG } from '../assets/svg/SVGs';
import { colors } from '../util/theme/theme';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import {
  createPlayList,
  loadPLayList,
  deletPLayList,
  addToPlayList,
} from '../redux/actions/actions';
import ItemList from '../ReusableComponent/ItemList';
import AppModal from '../ReusableComponent/AppMOdal';
import { useNavigation } from '@react-navigation/native';
import ReuseButton from '../ReusableComponent/ReuseButton';
import ReuseInput from '../ReusableComponent/ReuseInput';

interface PlayListComponentProps {
  mode?: 'default' | 'addSong';
  songToAdd?: any;
  onSongAdded?: (playListId: string) => void;
}

const PlayListComponent = ({
  mode = 'default',
  songToAdd,
  onSongAdded,
}: PlayListComponentProps) => {
  const dispatch = useAppDispatch();
  const { PlayList } = useAppSelector(state => state.songs);
  const navigation = useNavigation<any>();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!PlayList) {
      dispatch(loadPLayList());
    }
  }, [PlayList]);

  const handleCreate = () => {
    if (!name.trim()) return;
    dispatch(createPlayList(name));
    setName('');
    setModalVisible(false);
  };

  const handleCancel = () => {
    setName('');
    setModalVisible(false);
  };

  const hasPlaylists = !!PlayList?.length;

  const handleDeletePlaylist = (item: any) => {
    dispatch(deletPLayList(item.id ?? item.name));
  };

  const handleToggleAdd = (item: any) => {
    if (!songToAdd) return;
    dispatch(
      addToPlayList({ playListId: item.id ?? item.name, song: songToAdd }),
    );
    onSongAdded?.(item.id ?? item.name);
  };

  const isSongInPlaylist = (item: any) =>
    songToAdd ? item.songs?.some((s: any) => s.id === songToAdd.id) : false;

  return (
    <View style={styles.container}>
      {hasPlaylists ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              {mode === 'addSong' ? 'Add to playlist' : 'Playlists'}
            </Text>
            <ReuseButton
              style={styles.smallPlusButton}
              onPress={() => setModalVisible(true)}
            >
              <PlussVG height={20} width={20} />
            </ReuseButton>
          </View>

          <View style={styles.listWrapper}>
            <ItemList
              data={PlayList}
              keyExtractor={(item: any) => String(item.id ?? item.name)}
              getTitle={(item: any) => item.name}
              isSearch={false}
              getSubtitle={(item: any) =>
                `${item.songs?.length ?? 0} song${
                  item.songs?.length === 1 ? '' : 's'
                }`
              }
              onPressItem={
                mode === 'addSong'
                  ? undefined
                  : (item: any) => {
                      navigation.navigate('PlayListDetail', {
                        playlistName: item.name,
                        playlistId: item.id,
                      });
                    }
              }
              showIndex={false}
              onDeleteItem={
                mode === 'addSong' ? undefined : handleDeletePlaylist
              }
              isAdded={mode === 'addSong' ? isSongInPlaylist : undefined}
              onToggleAdd={mode === 'addSong' ? handleToggleAdd : undefined}
              Paddingbottom={100}
            />
          </View>
        </>
      ) : (
        <View style={styles.buttonBox}>
          <ReuseButton
            style={styles.PlusButton}
            onPress={() => setModalVisible(true)}
          >
            <PlussVG height={55} width={55} />
          </ReuseButton>
          <Text style={styles.create}>Create First Playlist</Text>
        </View>
      )}

      <AppModal
        visible={modalVisible}
        onClose={handleCancel}
        cardHeight="auto"
        maxCardHeight="60%"
        cardStyle={styles.createModalCard}
      >
        <Text style={styles.modalTitle}>New Playlist</Text>

        <ReuseInput
          value={name}
          onChangeText={setName}
          placeholder="Playlist name"
          style={styles.input}
          autoFocus
        />

        <View style={styles.modalActions}>
          <ReuseButton onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </ReuseButton>

          <ReuseButton onPress={handleCreate} style={styles.PlusButton}>
            <Text style={styles.create}>Create</Text>
          </ReuseButton>
        </View>
      </AppModal>
    </View>
  );
};

export default PlayListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  PlusButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  create: {
    color: '#ffff',
    fontWeight: '600',
    fontSize: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  smallPlusButton: {
    backgroundColor: colors.primary,
    padding: 6,
    borderRadius: 5,
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 10,
  },
  createModalCard: {
    padding: 20,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.textPrimary + '55',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: colors.textPrimary + '99',
    fontWeight: '600',
  },
});
