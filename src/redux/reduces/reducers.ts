import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SongProp } from '../../util/const/Type';
import { songs as offlineSongs } from '../../assets/OfflineSongs';
import { SongsState } from '../../util/const/Type';
import { AddFavourite, addToPlayList, createPlayList, deletPLayList, loadFavouriteSOng, loadPLayList, loadRecommendedSongs, removeFromPlayList, analyzeAndSaveSongs, loadAnalysisData, loadDeviceSongs } from '../actions/actions';
import { calculateThresholds, labelMood } from '../../customeHook/testDecode';


const initialState: SongsState = {
    songs: offlineSongs,
    deviceSong: [],
    favouriteSong: [],
    favouriteState: false,
    PlayList: [],
    recommendedSong: [],
    songAnalys: {},
    songMoods: {},
    analysisProgress: { done: 0, isAnalyzing: false, total: 0 },
    stopRequested: false
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
        },
        computeMoods(state) {
            const featureList = Object.values(state.songAnalys) as any[]

            if (featureList.length === 0) return

            const thresholds = calculateThresholds(featureList)
            const labeled = featureList.map(f => labelMood(f, thresholds))

            state.songMoods = labeled.reduce((acc: any, item: any) => {
                acc[item.id] = item
                return acc
            }, {})
        },
        setAnalysisProgress(state, action: PayloadAction<{ done: number; total: number; isAnalyzing: boolean }>) {
            state.analysisProgress = action.payload
        },
        requestStopAnalysis(state) {
            state.stopRequested = true
        },

        resetStopAnalysis(state) {
            state.stopRequested = false
        },
    },

    extraReducers: builder => {
        builder.addCase(loadFavouriteSOng.fulfilled, (state, action) => {
            state.favouriteSong = action.payload as any
            state.favouriteState = true
        })
       builder.addCase(loadDeviceSongs.fulfilled, (state, action) => {
    state.deviceSong = action.payload as any
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

        builder.addCase(analyzeAndSaveSongs.fulfilled, (state, action) => {
            state.songAnalys = action.payload as any

            const featureList = Object.values(state.songAnalys) as any[]
            if (featureList.length === 0) return

            const thresholds = calculateThresholds(featureList)
            const labeled = featureList.map(f => labelMood(f, thresholds))

            state.songMoods = labeled.reduce((acc: any, item: any) => {
                acc[item.id] = item
                return acc
            }, {})
        })
        builder.addCase(loadAnalysisData.fulfilled, (state, action) => {
            state.songAnalys = action.payload as any

            const featureList = Object.values(state.songAnalys) as any[]
            if (featureList.length === 0) return

            const thresholds = calculateThresholds(featureList)
            const labeled = featureList.map(f => labelMood(f, thresholds))

            state.songMoods = labeled.reduce((acc: any, item: any) => {
                acc[item.id] = item
                return acc
            }, {})
        })
    }
});

export const { setSongs, setDeviceSong, computeMoods, setAnalysisProgress, requestStopAnalysis, resetStopAnalysis } = globleState.actions;
export default globleState.reducer;