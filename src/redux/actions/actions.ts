import { createAsyncThunk } from "@reduxjs/toolkit";
import { FavouritSong, PlayListSong } from "../../util/const/ConstName";
import { loadData, StoreData } from "../../util/Storage/asyncStorageHelper";
import { PlaylistProp } from "../../util/const/Type";


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