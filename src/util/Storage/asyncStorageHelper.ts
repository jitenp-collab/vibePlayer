import AsyncStorage from "@react-native-async-storage/async-storage"

export const loadData = async (key: any) => {
    try {
        const CallData = await AsyncStorage.getItem(key)
        return CallData ? JSON.parse(CallData) : []
    } catch (error) {
        console.log(`Error at Load data key : ${key} , Error ${error}`);
    }
}


export const StoreData = async (key: any, data: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
        console.log(`error at create key : ${key} , data : ${data} error : ${error}`);
    }
}