import {appState, Chat, currentChatProxy} from "../../state/app-state.ts"
import TextArea from "./text-area.tsx"
import Recorder from "./recorder.tsx"
import React, {useEffect, useRef, useState} from "react"
import {subscribeKey} from "valtio/utils"
import {MessageList} from "./message-list/message-list.tsx"
import {PromptAttached} from "./prompt-attached.tsx"
import {cx} from "../../util/util.tsx"
import {useSnapshot} from "valtio/react"
import {layoutState} from "../../state/layout-state.ts"
import {throttle} from "lodash"


export const ChatWindow: React.FC = () => {

    const [chatProxy, setChatProxy] = useState<Chat | undefined>(undefined)
    // console.info("ChatWindow rendered", new Date().toLocaleString())
    const buttonRef = useRef<HTMLDivElement>(null)

    const {isPAPinning} = useSnapshot(layoutState)
    const {showRecorder} = useSnapshot(appState.pref)

    useEffect(() => {
        const callback = () => {
            const cp = currentChatProxy()
            setChatProxy(cp)
        }
        const unsubscribe = subscribeKey(appState, "currentChatId", callback)
        callback()
        return unsubscribe
    }, [])


    const handleMouseMove = throttle((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const [x, y] = [(rect.left + 18), (rect.top + 18)]
            layoutState.PAButtonDistance = Math.hypot(x - event.clientX, y - event.clientY)
        }
    }, 50)

    return (
        <div
            onMouseMove={handleMouseMove}
            className={cx("relative flex flex-col max-w-4xl rounded-xl w-full h-full items-center",
                "transition-all duration-200",
                isPAPinning ? "bg-opacity-0" : "bg-opacity-40 backdrop-blur bg-neutral-200"
            )}>
            {chatProxy !== undefined &&
                <>
                    <div
                        className={cx("flex flex-col items-center w-full",
                            "transition-all duration-300",
                            // use mb-10 to push message list outside screen
                            isPAPinning ? "h-full mb-10" : "h-0",
                        )}>
                        <PromptAttached chatProxy={chatProxy} key={chatProxy.id}/>
                    </div>

                    <div
                        className="flex flex-col items-center w-full h-full justify-between pb-2">
                        <>
                            <div ref={buttonRef}
                                 className="flex justify-between w-full px-2 py-1 backdrop-blur cursor-pointer">
                                <span className="icon-[f7--sidebar-left] w-5 h-5"
                                      onClick={() => appState.pref.showSidebar = !appState.pref.showSidebar}
                                ></span>
                                <p>{chatProxy?.name}</p>
                                <div
                                    className="flex justify-center items-center bg-neutral-500 rounded-full w-5 h-5 cursor-pointer"
                                    onClick={() => layoutState.isPAPinning = true}
                                >
                                    <p className="text-sm text-neutral-100">P</p>
                                </div>
                            </div>
                            <MessageList chatProxy={chatProxy} key={chatProxy.id}/>
                            <div
                                className="bottom-0 flex w-full flex-col items-center gap-2 rounded-xl px-2
                                md:px-4 lg:px-6 pt-1">
                                <TextArea chatProxy={chatProxy} key={chatProxy.id}/>
                                {
                                    showRecorder ?
                                        <div className="flex w-full items-center justify-center">
                                            <Recorder chatId={chatProxy.id}/>
                                        </div>
                                        : <div className="h-2"></div>
                                }
                            </div>
                        </>
                    </div>
                </>
            }
        </div>

    )
}

