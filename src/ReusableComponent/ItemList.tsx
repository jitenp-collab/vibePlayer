// ReusableComponent/ItemList.tsx
import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ItemListProps } from '../util/const/Type';
import { SearchBar } from './SearchBar';
import ItemCard from './ItemCard';

const Separator = () => <View style={styles.separator} />;

const ItemList = ({
  data,
  keyExtractor,
  getTitle,
  getSubtitle,
  getArtwork,
  onPressItem,
  showIndex = true,
  ListEmptyComponent,
  ListHeaderComponent, // <-- new
  refreshControl,
  isFavourite,
  onToggleFavourite,
  isAdded,
  onToggleAdd,
  isSearch = true,
  onDeleteItem,
  Paddingbottom,
}: ItemListProps) => {
  const [query, setquery] = useState('');

  const filterData = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();

    return data.filter((item: any) => {
      const title = getTitle(item)?.toLowerCase() ?? '';
      const subtitle = getSubtitle
        ? getSubtitle(item)?.toLowerCase() ?? ''
        : '';
      return title.includes(q) || subtitle.includes(q);
    });
  }, [query, data, getTitle, getSubtitle]);

  return (
    <FlatList
      data={isSearch ? filterData : data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => (
        <ItemCard
          item={item}
          index={index}
          getTitle={getTitle}
          getSubtitle={getSubtitle}
          getArtwork={getArtwork}
          onPressItem={onPressItem}
          showIndex={showIndex}
          isFavourite={isFavourite}
          onToggleFavourite={onToggleFavourite}
          onDeleteItem={onDeleteItem}
          isAdded={isAdded}
          onToggleAdd={onToggleAdd}
        />
      )}
      ItemSeparatorComponent={Separator}
      contentContainerStyle={[
        data.length === 0 && styles.emptyList,
        { paddingBottom: Paddingbottom },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={
        isSearch ? (
          <>
            {ListHeaderComponent}
            <SearchBar
              value={query}
              onChangeText={setquery}
              placeholder="Search songs, artists..."
              style={styles.searchBar}
            />
          </>
        ) : (
          ListHeaderComponent
        )
      }
      maxToRenderPerBatch={10}
      initialNumToRender={10}
      updateCellsBatchingPeriod={5000}
      alwaysBounceVertical
      removeClippedSubviews={false}
    />
  );
};

export default ItemList;

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  emptyList: { flexGrow: 1 },
  separator: { height: 10 },
  searchBar: { marginVertical: 15, marginHorizontal: 5 },
});