import React, {memo, useCallback, useEffect, useState} from 'react'
import {cx, formatAgo} from "../../../util/util.tsx"
import {Message} from "../../../data-structure/message.tsx"
import {MySpin} from "./widget/icon.tsx"
import {BsCheck2Circle} from "react-icons/bs"
import {CgDanger} from "react-icons/cg"
import {Theme} from "./theme.ts"
import MarkdownIt from "markdown-it/lib"
import hljs from 'highlight.js'
import 'highlight.js/styles/panda-syntax-dark.css'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import taskList from "markdown-it-task-lists"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import misub from "markdown-it-sub"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import misup from "markdown-it-sup"
import mila from "markdown-it-link-attributes"
import mimt from "markdown-it-multimd-table"
import miemoji from "markdown-it-emoji"
import mifoot from "markdown-it-footnote"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import './widget/highlightjs-plugins/copy-button-plugin.css'
import {LanguageLabelPlugin} from "./widget/highlightjs-plugins/language-label-plugin.tsx";
import {CopyButtonPlugin} from "./widget/highlightjs-plugins/copy-button-plugin.tsx";
import {useSnapshot} from "valtio/react";
import {appState} from "../../../state/app-state.ts";
import {controlState} from "../../../state/control-state.ts";
import {debounce, throttle} from "lodash";
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/react";

hljs.configure({
    ignoreUnescapedHTML: true,
});
hljs.addPlugin(new LanguageLabelPlugin());
hljs.addPlugin(new CopyButtonPlugin());

// debounce and throttle function only works as being singleton
const haDebounce = debounce(hljs.highlightAll, 0.5, {
    leading: true,
    trailing: true
})

const haThrottle = throttle(hljs.highlightAll, 0.5, {
    leading: true,
    trailing: true
})

interface TextProps {
    messageSnap: Message
    theme: Theme
}

export const MyText: React.FC<TextProps> = ({messageSnap, theme}) => {
    // console.info("MyText rendered, messageSnap.id:", messageSnap.id, new Date().toLocaleString())
    // console.info("messageSnap.text", messageSnap.text)
    const {showMarkdown} = useSnapshot(appState.pref)
    const {isWindowsBlurred} = useSnapshot(controlState)
    const [text, setText] = useState(messageSnap.text)
    const [latestText, setLatestText] = useState<string | undefined>()
    const [hovering, setHovering] = useState(false)

    const haNow = useCallback(() => showMarkdown && hljs.highlightAll(), [showMarkdown])

    const haTh = useCallback(() => showMarkdown && haThrottle(), [showMarkdown])

    const haDe = useCallback(() => showMarkdown && haDebounce(), [showMarkdown])

    // run after text first loading
    useEffect(() => {
        haDe()
    }, [haDe]);

    useEffect(() => {
        if (isWindowsBlurred) {
            setHovering(false)
        }
    }, [isWindowsBlurred]);

    useEffect(() => {
        setLatestText(messageSnap.text)
    }, [messageSnap.text]);

    useEffect(() => {
        if (!hovering && latestText && latestText != text) {
            // if user is moving the cursor away and there is text in the buffer
            setText(latestText)
            if (messageSnap.status == "typing") {
                haTh()
            } else {
                // highlight after latestText is added to the UI
                setTimeout(haNow)
            }
        }
    }, [hovering, latestText, messageSnap.status, haNow, text, haTh]);

    useEffect(() => {
        hovering && messageSnap.status == "typing" && haNow()
    }, [hovering, messageSnap.status, haNow])

    useEffect(() => {
        if (hovering) {
            if (messageSnap.status === "typing") {
                controlState.textPendingState = "pending"
                return
            } else if (latestText && latestText !== text) {
                controlState.textPendingState = "done"
                return;
            }
        }
        controlState.textPendingState = "none"
    }, [hovering, latestText, messageSnap.status, text]);

    return <div
        className={cx("flex flex-col rounded-2xl px-3 pt-1.5 pb-0.5",
            theme.text, theme.bg
        )}
        onMouseOver={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
    >

        <div className={cx("leading-snug",
            "prose-pre:p-0 prose-pre:pt-3 prose-li:marker:text-neutral-600"
        )}>
            {messageSnap.role === 'assistant' && showMarkdown ?
                <MDText text={text}/>
                :
                <p className="leading-snug whitespace-pre-wrap break-words">{text}</p>
            }
        </div>
        <div className="flex justify-end gap-1 pointer-events-none">
            <p className="text-xs inline whitespace-nowrap" data-pseudo-content={formatAgo(messageSnap.createdAt)}></p>
            {['sent', 'received'].includes(messageSnap.status) &&
                <BsCheck2Circle className={"h-4 w-4" + theme.normalIcon}/>
            }
            {messageSnap.status === 'sending' &&
                <MySpin className={"h-4 w-4 " + theme.normalIcon}/>
            }
            {messageSnap.status === 'error' &&
                <div className="leading-none">
                    <CgDanger className={"w-4 h-4 mr-1 inline " + theme.warningIcon}/>
                    <p className="text-xs inline">{messageSnap.errorMessage}</p>
                </div>
            }
            {messageSnap.context &&
                <Popover color={"foreground"} backdrop="blur">
                    <PopoverTrigger>
                        <span className="icon-[octicon--info-24] pointer-events-auto cursor-pointer"/>
                    </PopoverTrigger>
                    <PopoverContent>
                        <InfoTooltip messageSnap={messageSnap}/>
                    </PopoverContent>
                </Popover>
            }
        </div>
    </div>
}

interface InfoTooltipProps {
    messageSnap: Message
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({messageSnap}) => {
    const gemini = messageSnap.context?.talkOption.llmOption?.gemini;
    const gpt = messageSnap.context?.talkOption.llmOption?.chatGPT;
    const context = messageSnap.context;
    return <div className="flex flex-col gap-2 px-1 py-2">
        {gemini &&
            <InfoTooltipKV k="Gemini Model" value={gemini.model}/>
        }
        {gpt &&
            <InfoTooltipKV k="ChatGPT Model" value={gpt.model}/>
        }
        {context && <InfoTooltipKV k="Attached Messages" value={context.attachedMessageCount}/>}
        {context && <InfoTooltipKV k="Prompt Messages" value={context.promptCount}/>}
        <InfoTooltipKV k="Words" value={messageSnap.text.split(" ").length}/>
        <InfoTooltipKV k="Chars" value={messageSnap.text.length}/>
    </div>
}

const InfoTooltipKV: React.FC<{ k: string, value: number | string }> = ({k, value}) => {
    return <div className="flex gap-2 justify-between">
        <div className="font-thin">{k}</div>
        <div className="">{value}</div>
    </div>
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const md = new MarkdownIt({
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
        if (!lang || !hljs.getLanguage(lang)) {
            lang = "plaintext"
        }
        try {
            return `<pre class="hljs">` +
                `<code class='hljs language-${lang}'>` +
                `${hljs.highlight(str, {language: lang, ignoreIllegals: true}).value}` +
                "</code>" +
                "</pre>"
        } catch (_) { /* empty */
        }
    },
})
    .use(taskList, {enabled: true, label: true})
    .use(mimt)
    .use(mifoot)
    .use(miemoji)
    .use(misub)
    .use(misup)
    .use(mila, {
        attrs: {
            target: "_blank",
            rel: "noopener noreferrer",
        },
    })

type Props = {
    text: string
}

const MDText = memo(function MDText({text}: Props) {
    const h = md.render(text)
    return <div className="leading-snug prose" dangerouslySetInnerHTML={{__html: h}}/>
})

