import React, {useState} from "react";
import {cx} from "../../../util/util.tsx";
import {capitalize} from "lodash";

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