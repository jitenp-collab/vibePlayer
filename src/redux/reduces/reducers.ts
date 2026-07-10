import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SongProp } from '../../util/const/Type';
import { songs as offlineSongs } from '../../assets/OfflineSongs';
import { SongsState } from '../../util/const/Type';
import { AddFavourite, addToPlayList, createPlayList, deletPLayList, loadFavouriteSOng, loadPLayList, loadRecommendedSongs, removeFromPlayList } from '../actions/actions';


const initialState: SongsState = {
    songs: offlineSongs,
    deviceSong: [],
    favouriteSong: [],
    favouriteState: false,
    PlayList: [],
    recommendedSong: []
};

const globleState = createSlice({

    name: 'songs',
    initialState,

    reducers: {
        setSongs(state, action: PayloadAction<SongProp[]>) {
            state.songs = action.payload;
        },

        setDeviceSong(state, action: PayloadAction<SongProp[]>) {
            state.deviceSong = action.payload
        }
    },

    extraReducers: builder => {
        builder.addCase(loadFavouriteSOng.fulfilled, (state, action) => {
            state.favouriteSong = action.payload as any
            state.favouriteState = true
        })

        builder.addCase(AddFavourite.fulfilled, (state, action) => {
            state.favouriteSong = action.payload?.list as any
            state.favouriteState = true
        })

        builder.addCase(loadPLayList.fulfilled, (state, action) => {
            state.PlayList = action.payload as any
        })

        builder.addCase(createPlayList.fulfilled, (state, action) => {
            state.PlayList = action.payload as any
        })

        builder.addCase(deletPLayList.fulfilled, (state, action) => {
            state.PlayList = action.payload as any
        })

        builder.addCase(addToPlayList.fulfilled, (state, action) => {
            state.PlayList = action.payload as any
        })

        builder.addCase(removeFromPlayList.fulfilled, (state, action) => {
            state.PlayList = action.payload as any
        })

        builder.addCase(loadRecommendedSongs.fulfilled, (state, action) => {
            state.recommendedSong = action.payload as any ?? []
        })
    }
});

export const { setSongs, setDeviceSong } = globleState.actions;
export default globleState.reducer;