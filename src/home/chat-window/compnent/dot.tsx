/* eslint-disable valtio/state-snapshot-rule */
import React, {useCallback, useEffect, useState} from "react";
import {cx} from "../../../util/util.tsx";
import {capitalize} from "lodash";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";
import {Selection} from "@react-types/shared/src/selection";
import {useSnapshot} from "valtio/react";
import {appState, Chat} from "../../../state/app-state.ts";
import {Model} from "../../../api/sse/server-ability.ts";

interface PopOverDotProps {
    text: string
    popOverText: string
    fixedRound?: boolean
    activated?: boolean
    action?: () => void
}

export const PopOverDot: React.FC<PopOverDotProps> = ({text, popOverText, fixedRound = true, activated, action}) => {
    const [hovering, setHovering] = useState(false)

    return <div onMouseOver={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={action}
                className="relative flex transition-all duration-100">
        <p className={cx("flex justify-center items-center select-none text-[11px] rounded-full h-5",
            "duration-100",
            fixedRound ? "w-5 cursor-pointer" : "px-2 text-sm pb-0.5",
            activated ? "bg-blue-600 bg-opacity-80 text-neutral-100" : "text-violet-100 bg-black/[0.3]",
            action && "hover:scale-125 hover:backdrop-blur",
            !activated && action && "hover:bg-black/[0.5]"
        )}>
            {text}
        </p>
        <div className={cx("absolute bg-neutral-800/[0.8] rounded-full px-4 py-1 -top-8",
            "left-1/3 -translate-x-1/3 transform whitespace-nowrap",
            "text-sm text-neutral-200 backdrop-blur-lg",
            hovering ? "block" : "hidden"
        )}>
            {capitalize(popOverText)}
        </div>
    </div>
}

interface ModelSelectionProps {
    chatProxy: Chat
}

export default function ModelSelection({chatProxy}: ModelSelectionProps) {
    const chatSnap = useSnapshot(chatProxy);


    const [models, setModels] = useState<Model[]>([]);
    const [currentModel, setCurrentModel] = useState<string | undefined>(undefined);

    useEffect(() => {
        const models: Model[] = [];
        if (chatSnap.option.llm.gemini.enabled && appState.ability.llm.gemini.models) {
            appState.ability.llm.gemini.models?.forEach(it => models.push(it as Model))
            setCurrentModel(chatSnap.option.llm.gemini.model)
        } else if (chatSnap.option.llm.chatGPT.enabled && appState.ability.llm.chatGPT.models) {
            appState.ability.llm.chatGPT.models?.forEach(it => models.push(it as Model))
            setCurrentModel(chatSnap.option.llm.chatGPT.model)
        }
        setModels(models)
    }, [chatSnap.option.llm.chatGPT.enabled, chatSnap.option.llm.chatGPT.model, chatSnap.option.llm.gemini.enabled, chatSnap.option.llm.gemini.model]);

    const changeModel = useCallback((key: Selection) => {
        if (chatSnap.option.llm.gemini.enabled) {
            const found = appState.ability.llm.gemini.models?.find(it => key === 'all' || key.has(it.name))
            if (found) {
                chatProxy.option.llm.gemini.model = found.name
            }
        } else if (chatSnap.option.llm.chatGPT.enabled) {
            const found = appState.ability.llm.chatGPT.models?.find(it => key === 'all' || key.has(it.name))
            if (found) {
                chatProxy.option.llm.chatGPT.model = found.name
            }
        }
        if (key === 'all') {
            setCurrentModel(undefined)
        } else {
            (key as Set<string>).forEach(it => setCurrentModel(it))
        }
    }, [chatProxy.option.llm.chatGPT, chatProxy.option.llm.gemini, chatSnap.option.llm.chatGPT.enabled, chatSnap.option.llm.gemini.enabled]);

    const selectedValue = currentModel ?? ""

    const selectedKeys = currentModel ? [currentModel] : []

    if (models.length === 0 || !currentModel) return null

    return (
        <Dropdown className="bg-neutral-200">
            <DropdownTrigger>
                <Button
                    className={cx("select-none text-[13px] rounded-full h-5 text-violet-100 bg-black/[0.3]"
                        , "text-neutral-100 text-center leading-none px-2 pb-0.5")}
                >
                    {selectedValue + " " + modelEmoji(selectedValue)}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Single selection example"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={selectedKeys}
                onSelectionChange={key => changeModel(key)}
            >
                {models.map((model) => (
                    <DropdownItem key={model.name}>
                        <div className="flex justify-between">
                            <div>{model.displayName}</div>
                            <div>{modelEmoji(model.name)}</div>
                        </div>
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    );
}

const modelEmoji = (model: string) => {
    switch (model) {
        case "gpt-4":
            return "🚀🚀🚀"
        case "gpt-3.5-turbo":
            return "👌"
        default :
            return "";
    }
}
