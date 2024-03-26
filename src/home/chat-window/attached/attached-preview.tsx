import React, {useEffect, useRef, useState} from "react"
import {Chat} from "../../../state/app-state.ts"
import {useSnapshot} from "valtio/react";
import {attachedMessages} from "../../../api/restful/util.ts";
import {LLMMessage} from "../../../shared-types.ts";
import {subscribeKey} from "valtio/utils";
import {layoutState} from "../../../state/layout-state.ts";
import {findPrompt, Prompt, promptState} from "../../../state/promt-state.ts";
import {AttachedItem} from "./attached-item.tsx";
import {cx} from "../../../util/util.tsx";
import {PromptEditor} from "../prompt/prompt-editor.tsx";
import {CloseIcon} from "../compnent/widget/icon.tsx";

type HPProps = {
    chatProxy: Chat
}

export const AttachedPreview: React.FC<HPProps> = ({chatProxy}) => {
    // console.info("AttachedPreview rendered", new Date().toLocaleString())
    const {isPAPinning} = useSnapshot(layoutState)
    const [hist, setHist] = useState<LLMMessage[]>([])
    const [promptProxy, setPromptProxy] = useState<Prompt | undefined>()
    const [inputText, setInputText] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const updateMessages = () => {
            if (isPAPinning) {
                const h = attachedMessages(chatProxy.messages, chatProxy.option.llm.maxAttached)
                setHist(h)
            }
        }
        updateMessages()
        const un1 = subscribeKey(chatProxy.option.llm, "maxAttached", updateMessages)
        const un2 = subscribeKey(chatProxy, "messages", updateMessages)

        const updatePrompt = () => {
            if (isPAPinning) {
                if (chatProxy.promptId !== "") {
                    const p = findPrompt(chatProxy.promptId)
                    setPromptProxy(p)
                    if (!p) {
                        console.error("prompt not found", chatProxy.promptId)
                        chatProxy.promptId = ""
                    }
                } else {
                    setPromptProxy(undefined)
                }
            }
        }
        updatePrompt()
        const un3 = subscribeKey(chatProxy, "promptId", updatePrompt)
        const un31 = subscribeKey(promptState, "prompts", updatePrompt)

        const updateInputText = () => {
            if (isPAPinning) {
                setInputText(chatProxy.inputText)
            }
        }
        updateInputText()
        const un4 = subscribeKey(chatProxy, "inputText", updatePrompt)

        return () => {
            un1()
            un2()
            un3()
            un31()
            un4()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPAPinning]);

    return (
        <div
            className={cx("flex flex-col w-full pb-2",
                "bg-opacity-40 backdrop-blur bg-neutral-200 rounded-lg"
            )}>
            <div className="flex items-center justify-end p-2 pt-1">
                <div
                    onClick={() => layoutState.isPAPinning = false}
                    className={cx("rounded-full text-neutral-500 p-0.5 bg-neutral-500 cursor-pointer",
                    )}>
                    <CloseIcon className="h-4 w-4 stroke-[2px] stroke-neutral-100"/>
                </div>
            </div>
            <div
                ref={scrollRef}
                style={{scrollbarGutter: "stable"}}
                className={cx("flex flex-col gap-5 overflow-y-auto overflow-x-hidden",
                    "scrollbar-hidden hover:scrollbar-visible-neutral-300"
                )}>
                <div className="flex flex-col gap-0.5">
                    <p className="px-1 ml-1.5 text-neutral-500 font-bold mr-auto">Prompt</p>
                    <div
                        className="flex flex-col px-1 ml-1.5 mr-0.5 pb-3 py-1 border-2 border-dashed border-neutral-500 rounded-lg gap-1">
                        {promptProxy ?
                            <>
                                <PromptEditorTitle promptProxy={promptProxy}/>
                                <PromptEditor chatProxy={chatProxy} promptProxy={promptProxy}/>
                            </>
                            :
                            <EmptyPromptEditorTitle/>
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-center px-1 ml-1.5">
                        <p className="text-neutral-500 font-bold mr-auto">Messages Preview</p>
                        <p className="text-neutral-500 text-xs "> messages below will be sent to the LLM server</p>
                    </div>
                    <div
                        className="flex flex-col gap-2 px-1 py-2 ml-1.5 mr-0.5 pb-2 border-2 border-dashed border-neutral-500 rounded-lg">
                        {
                            hist.map((h, index) => (
                                    <div key={index}>
                                        <AttachedItem message={h}/>
                                    </div>
                                )
                            )
                        }
                        {inputText &&
                            <div>
                                <AttachedItem message={{role: "user", content: inputText}}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}


type Props = {
    promptProxy: Prompt
}

const PromptEditorTitle: React.FC<Props> = ({promptProxy}) => {
    const {name} = useSnapshot(promptProxy, {sync: true})

    return (
        <input name="prompt name"
               style={{width: `${name.length + 1}ch`}}
               className={cx("whitespace-nowrap outline-none bg-neutral-100/[0.5] rounded-xl",
                   "text-neutral-800 text-lg m-auto text-center")}
               value={name}
               onChange={e => promptProxy.name = e.target.value}
        />
    )
}

const EmptyPromptEditorTitle = () => {
    return (
        <div className="flex items-center text-lg gap-1 text-neutral-600">
            <div className="select-none">Please select a prompt or create a new one</div>
        </div>
    )
}