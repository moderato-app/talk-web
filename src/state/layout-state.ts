import {proxy} from "valtio"


export type Layout = {
    settingPanelScrollOffset: number
    isMessageListOverflow: boolean
    isMessageListAtBottom: boolean
    isPAPinning: boolean
    PAButtonDistance: number
    PAButtonWheelDeltaY: number
}

export const layoutState = proxy<Layout>({
    settingPanelScrollOffset: 0,
    isMessageListOverflow: false,
    isMessageListAtBottom: false,
    isPAPinning: false,
    PAButtonDistance: 1000,
    PAButtonWheelDeltaY:0,
})