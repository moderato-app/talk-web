import React, {useEffect, useState} from "react"
import {CopyToClipboard} from "react-copy-to-clipboard"
import {MdOutlineContentCopy} from "react-icons/md"
import {cx} from "../../../util/util.tsx"
import {audioDb} from "../../../state/db.ts"
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/react";

type CopyProps = {
    text: string
}

export const Copy: React.FC<CopyProps> = ({text}) => {
    const [copied, setCopied] = useState(false)
    useEffect(() => {
        const timer = setTimeout(() => {
            setCopied(false)
        }, 350)

        return () => {
            clearTimeout(timer)
        }
    }, [copied])
    return <CopyToClipboard text={text}
                            onCopy={() => setCopied(true)}>
        <MdOutlineContentCopy className={cx("p-1 rounded transition-all duration-100 h-8 w-8",
            copied ? "scale-125" :
                "h-7 w-7 text-violet-50 hover:text-neutral-500 hover:bg-white/[0.8]"
        )}/>
    </CopyToClipboard>
}

type TextMenuProps = {
    deleteAction: () => void
    textToCopy: string,
    audioId?: string
}

export const GeneralMenu: React.FC<TextMenuProps> = ({textToCopy, audioId, deleteAction}) => {

    const [url, setUrl] = useState("")

    useEffect(() => {
            if (audioId) {
                audioDb.getItem<Blob>(audioId, (err, blob) => {
                        if (err) {
                            console.warn("failed to loaded audio blob, audioId:", audioId, err)
                            return
                        }
                        if (blob) {
                            const url = URL.createObjectURL(blob)
                            setUrl(url)
                        } else {
                            // audio is expected to be empty after restoring from an uploaded json file
                            //  console.error("audio blob is empty, audioId:", audioId)
                        }
                    }
                ).then(() => true)
            }
        }, [audioId]
    )

    return <Dropdown className="bg-neutral-200">
        <DropdownTrigger>
            <span className="icon-[ph--dots-three-bold] h-8 w-8 p-1 text-violet-50 hover:text-violet-200"/>
        </DropdownTrigger>
        {audioId ?
            <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="download" target="_blank" href={url} download={true}>
                    Download
                </DropdownItem>
                <DropdownItem key="delete" className="text-danger" color="danger" onClick={deleteAction}>
                    Delete
                </DropdownItem>
            </DropdownMenu>
            :
            <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="copy" onClick={() => navigator.clipboard.writeText(textToCopy)}>Copy</DropdownItem>
                <DropdownItem key="delete" className="text-danger" color="danger" onClick={deleteAction}>
                    Delete
                </DropdownItem>
            </DropdownMenu>
        }
    </Dropdown>
}