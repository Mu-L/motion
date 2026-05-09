import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

/**
 * Manual reproduction harness for issue #3241: memory leak when scrolling a
 * virtualized list of motion.div elements with initial/animate.
 *
 * Open the page in Chrome, then watch the "DOM Nodes" counter in the
 * Performance Monitor (Cmd-Shift-P → "Show performance monitor"). With the
 * leak, node count grows without bound; once fixed, it should stabilise.
 */

const ITEM_HEIGHT = 50
const TOTAL_ITEMS = 200
const VISIBLE_ITEMS = 10

export const App = () => {
    const [scrollIndex, setScrollIndex] = useState(0)
    const cycleCountRef = useRef(0)

    useEffect(() => {
        const id = setInterval(() => {
            cycleCountRef.current += 1
            setScrollIndex(
                (i) => (i + VISIBLE_ITEMS) % (TOTAL_ITEMS - VISIBLE_ITEMS)
            )
        }, 50)
        return () => clearInterval(id)
    }, [])

    const visible = []
    for (let i = scrollIndex; i < scrollIndex + VISIBLE_ITEMS; i++) {
        visible.push(i)
    }

    return (
        <div>
            <div id="cycle-count" data-count={cycleCountRef.current}>
                Cycle: {cycleCountRef.current}
            </div>
            <div
                id="scroll-container"
                style={{
                    height: VISIBLE_ITEMS * ITEM_HEIGHT,
                    overflow: "hidden",
                    border: "1px solid #ccc",
                }}
            >
                {visible.map((i) => (
                    <motion.div
                        key={i}
                        id={`item-${i}`}
                        className="virtual-item"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            height: ITEM_HEIGHT,
                            background: `hsl(${(i * 7) % 360}, 80%, 90%)`,
                            padding: 10,
                            boxSizing: "border-box",
                        }}
                    >
                        Item {i}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
