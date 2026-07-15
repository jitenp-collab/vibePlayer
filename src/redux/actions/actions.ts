import { createAsyncThunk } from "@reduxjs/toolkit";
import { FavouritSong, PlayListSong, PlayHistory, SongAnalysis,DeviceSongCache } from "../../util/const/ConstName";
import { loadData, StoreData } from "../../util/Storage/asyncStorageHelper";
import { PlaylistProp } from "../../util/const/Type";
import { analyzeSong } from "../../customeHook/testDecode";
import { setAnalysisProgress } from "../reduces/reducers";


export const loadFavouriteSOng = createAsyncThunk("song/favourite", async () => {
    try {
        const store = await loadData(FavouritSong) ?? []
        return store
    } catch (error) {
        console.log("error ast getting the favouriteSong", error);
    }
})

export const AddFavourite = createAsyncThunk("song/addFavourite", async (item: any) => {
    try {
        const getFav = await loadData(FavouritSong) ?? []
        // const read = getFav ? JSON.parse(getFav) : []
        const check = getFav.some((song: any) => song.id === item.id)
        const update = check ? getFav.filter((song: any) => song.id !== item.id) : [...getFav, item]
        await StoreData(FavouritSong, update)
        // AsyncStorage.setItem(FavouritSong, JSON.stringify(update))
        return {
            list: update,
            action: check ? "removed" : "added"
        }
    } catch (error) {
        console.log("Error to add the song", error);
    }
})

export const loadDeviceSongs = createAsyncThunk("song/loadDeviceSongs", async () => {
    try {
        const cached = await loadData(DeviceSongCache) ?? []
        return cached
    } catch (error) {
        console.log("Error hydrating cached device songs", error)
        return []
    }
})


export const loadPLayList = createAsyncThunk("playList/load", async () => {
    try {
        const data = await loadData(PlayListSong)
        return data ?? []
    } catch (error) {
        console.log("Errro to load playLIst Data", error);
    }
})

export const createPlayList = createAsyncThunk("playList/create", async (name: any) => {
    try {
        const PlayList = await loadData(PlayListSong) ?? []
        const newPLayList: PlaylistProp = {
            id: Date.now().toString(),
            name: name.trim(),
            songs: [],
            createdAt: Date.now()
        }
        const update = [...PlayList, newPLayList]
        await StoreData(PlayListSong, update)
        return update

    } catch (error) {
        console.log("Error to create a PLayList", error);
    }
})


export const deletPLayList = createAsyncThunk("PlayList/delet", async (PlayListId: any) => {
    try {
        const list = await loadData(PlayListSong) ?? []
        const update = list.filter((p: any) => p.id !== PlayListId)
        await StoreData(PlayListSong, update)
        return update
    } catch (error) {
        console.log("error to delete the PLayList", error);
    }
})

export const addToPlayList = createAsyncThunk("playList/addsong", async ({ playListId, song }: { playListId: string, song: any }) => {
    try {
        const list = await loadData(PlayListSong) ?? []

        const update = list.map((p: any) => {
            if (p.id !== playListId) return p
            const exist = p.songs.some((s: any) => s.id === song.id)
            if (exist) return p
            return {
                ...p,
                songs: [...p.songs, song]
            }
        })

        await StoreData(PlayListSong, update)
        return update
    } catch (error) {
        console.log("error to add the son in PLayList", error);
    }
})

export const removeFromPlayList = createAsyncThunk(
    "playList/removesong",
    async ({ playListId, songId }: { playListId: string; songId: string }) => {
        try {
            const list = await loadData(PlayListSong) ?? []
            const update = list.map((p: any) => {
                if (p.id !== playListId) return p
                return {
                    ...p,
                    songs: p.songs.filter((s: any) => s.id !== songId),
                }
            })
            await StoreData(PlayListSong, update)
            return update
        } catch (error) {
            console.log("error to remove the song from PLayList", error);
        }
    }
)

export const recordPlay = createAsyncThunk("song/recordPlay", async (songId: string) => {
    try {
        const raw = await loadData(PlayHistory)
        const history: { [key: string]: number } = (raw && !Array.isArray(raw)) ? raw : {}
        history[songId] = (history[songId] || 0) + 1
        await StoreData(PlayHistory, history)
        // console.log("play recorded:", history)
        return history
    } catch (error) {
        console.log("Error to record play", error)
    }
})

export const loadRecommendedSongs = createAsyncThunk(
    "song/recommend",
    async (_, { getState }: any) => {
        try {
            const history = await loadData(PlayHistory) ?? {}
            const state = getState()
            const allSongs = state.songs.songs

            const genreScore: { [key: string]: number } = {}
            allSongs.forEach((song: any) => {
                const playCount = history[song.id] || 0
                if (playCount === 0) return
                song.genres.forEach((g: string) => {
                    genreScore[g] = (genreScore[g] || 0) + playCount
                    // console.log("From the genreScore[g]",genreScore[g]);

                })
            })

            // no listening history yet → no recommendations to show
            if (Object.keys(genreScore).length === 0) return []

            const scored = allSongs.map((song: any) => {
                const score = song.genres.reduce((sum: number, g: string) => sum + (genreScore[g] || 0), 0)
                return { song, score, playCount: history[song.id] || 0 }
            })

            // only keep songs with a real match (score > 0), drop everything else
            return scored
                .filter((s: any) => s.score > 0)
                .sort((a: any, b: any) => b.score - a.score || a.playCount - b.playCount)
                .map((s: any) => s.song)
                .slice(0, 10)
        } catch (error) {
            console.log("Error to load recommended songs", error)
        }
    }
)

import { resetStopAnalysis } from "../reduces/reducers"; // add to existing import line

export const analyzeAndSaveSongs = createAsyncThunk(
    "song/analyze",
    async (songs: any[], { rejectWithValue, dispatch, getState }) => {
        let stopWatcherId: ReturnType<typeof setInterval> | null = null;
        try {
            const saved = await loadData(SongAnalysis) ?? {}
            const alreadyDone = songs.filter(song => saved[song.id]).length
            const unanalyzed = songs.filter(song => !saved[song.id])

            if (unanalyzed.length === 0) {
                dispatch(setAnalysisProgress({ done: songs.length, total: songs.length, isAnalyzing: false }))
                return saved
            }

            dispatch(resetStopAnalysis())
            dispatch(setAnalysisProgress({ done: alreadyDone, total: songs.length, isAnalyzing: true }))

            const wait = (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms))

            // one shared "stop" signal, checked every 150ms, races against whatever
            // song is currently being analyzed so a click takes effect immediately
            const stopSignal = new Promise<'stopped'>(resolve => {
                stopWatcherId = setInterval(() => {
                    const st = getState() as any
                    if (st.songs.stopRequested) {
                        if (stopWatcherId) clearInterval(stopWatcherId)
                        resolve('stopped')
                    }
                }, 150)
            })

            const analyzeOne = async (acc: { updated: any; count: number }, song: any) => {
                const state = getState() as any
                if (state.songs.stopRequested) return acc // nothing left to do this run

                const outcome = await Promise.race([
                    analyzeSong(song.id, song.url),
                    stopSignal,
                ])

                if (outcome === 'stopped') {
                    // don't count this song, don't save a partial result — bail now
                    return acc
                }

                const result = outcome
                if (result) {
                    acc.updated[song.id] = result
                    await StoreData(SongAnalysis, acc.updated)
                }

                acc.count += 1
                dispatch(setAnalysisProgress({ done: alreadyDone + acc.count, total: songs.length, isAnalyzing: true }))

                await wait(50)
                return acc
            }

            const finalAcc = await unanalyzed.reduce(
                (promiseChain, song) => promiseChain.then((acc: any) => analyzeOne(acc, song)),
                Promise.resolve({ updated: { ...saved }, count: 0 })
            )

            dispatch(setAnalysisProgress({ done: alreadyDone + finalAcc.count, total: songs.length, isAnalyzing: false }))
            dispatch(resetStopAnalysis())

            return finalAcc.updated

        } catch (error) {
            console.log("Error to analyze songs", error)
            dispatch(setAnalysisProgress({ done: 0, total: 0, isAnalyzing: false }))
            return rejectWithValue(error)
        } finally {
            if (stopWatcherId) clearInterval(stopWatcherId)
        }
    }
)

export const loadAnalysisData = createAsyncThunk("song/hydrateAnalysis", async () => {
    try {
        const saved = await loadData(SongAnalysis) ?? {}
        return saved
    } catch (error) {
        console.log("Error hydrating analysis data", error)
        return {}
    }
})



