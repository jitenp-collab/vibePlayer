import { useCallback, useEffect, useState } from "react"
import { useAudioPermission } from "./useAudioPernission"
import { getDeviceAudioFiles } from "./getDeviceAudio"
import { useAppDispatch, useAppSelector } from "../redux/hook"
import { deviceFilesToSongs } from "./deviceAudioTosong"
import { setDeviceSong, computeMoods } from "../redux/reduces/reducers"
import { StoreData } from "../util/Storage/asyncStorageHelper"
import {DeviceSongCache} from "../util/const/ConstName"

export const useDeviceAudio = () => {
    const { isAllowed } = useAudioPermission()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { deviceSong } = useAppSelector(state => state.songs)
    const dispatch = useAppDispatch()

    const load = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await getDeviceAudioFiles()
            const convert = deviceFilesToSongs(result)
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

    useEffect(() => {
        if (!isAllowed) return
        load()
    }, [isAllowed, load])

    return { deviceSong, isAllowed, isLoading, error, refresh: load }
}