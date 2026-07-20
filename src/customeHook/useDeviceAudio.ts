import { useCallback, useEffect, useState } from "react"
import { Platform } from "react-native"
import { useAudioPermission } from "./useAudioPernission"
import { getDeviceAudioFiles } from "../util/getDeviceAudio"
import { useAppDispatch, useAppSelector } from "../redux/hook"
import { deviceFilesToSongs } from "../util/deviceAudioTosong"
import { setDeviceSong, computeMoods } from "../redux/reduces/reducers"
import { StoreData } from "../util/Storage/asyncStorageHelper"
import { DeviceSongCache } from "../util/const/ConstName"
import { loadDeviceSongs } from "../redux/actions/actions"

export const useDeviceAudio = () => {
    const { isAllowed } = useAudioPermission()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { deviceSong } = useAppSelector(state => state.songs)
    const dispatch = useAppDispatch()

    // Android: silent full rescan — always reflects exactly what's on disk right now,
    // so replacing the whole list is correct here.
    
    const scanAndReplace = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getDeviceAudioFiles()
            const convert = await deviceFilesToSongs(result)
            dispatch(setDeviceSong(convert))
            await StoreData(DeviceSongCache, convert)
            dispatch(computeMoods())
        } catch (err) {
            console.log("Failed to load audio files", err)
            setError("Something went wrong while scanning for audio files")
        } finally {
            setIsLoading(false)
        }
    }, [dispatch])


    const pickAndMergeIOS = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getDeviceAudioFiles() // opens native picker
            if (result.length === 0) return // user cancelled — nothing to merge

            const picked = await deviceFilesToSongs(result)

            const existingIds = new Set(deviceSong.map(s => s.id))
            const trulyNew = picked.filter(s => !existingIds.has(s.id))

            const merged = [...deviceSong, ...trulyNew]

            dispatch(setDeviceSong(merged))
            await StoreData(DeviceSongCache, merged)
            dispatch(computeMoods())
        } catch (err) {
            console.log("Failed to import audio files", err)
            setError("Something went wrong while importing audio files")
        } finally {
            setIsLoading(false)
        }
    }, [dispatch, deviceSong])

    useEffect(() => {
        if (!isAllowed) return
        if (Platform.OS === 'ios') {
            // hydrate previously-imported songs from AsyncStorage — never auto-opens the picker
            dispatch(loadDeviceSongs())
        } else {
            scanAndReplace()
        }
    }, [isAllowed, dispatch, scanAndReplace])

    const pickSongs = Platform.OS === 'ios' ? pickAndMergeIOS : scanAndReplace

    return { deviceSong, isAllowed, isLoading, error, pickSongs, refresh: scanAndReplace }
}