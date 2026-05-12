import { useMotionValueEvent, useScroll } from "framer-motion"
import * as React from "react"
import { useEffect, useRef, useState } from "react"
import * as ReactDOMClient from "react-dom/client"

/**
 * Reproduction for #2851 — useScroll target ref hydrated after the hook's
 * own effects run (e.g. via querySelector in a useEffect declared after
 * useScroll). Before the fix, useScroll fell back to the whole-window scroll
 * because target.current was still null when its useEffect ran.
 *
 * The actual reproduction is rendered in a fresh ReactDOM root so it isn't
 * wrapped by the dev harness's StrictMode — StrictMode's double-mount in dev
 * masks the bug because the second mount sees the hydrated ref.
 */
export const App = () => {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!containerRef.current) return
        const root = ReactDOMClient.createRoot(containerRef.current)
        root.render(<Repro />)
        // Defer unmount: React 18 errors when a root is unmounted
        // synchronously from another root's effect cleanup.
        return () => {
            queueMicrotask(() => root.unmount())
        }
    }, [])

    return <div ref={containerRef} />
}

const Repro = () => {
    const targetRef = useRef<HTMLDivElement | null>(null)

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })

    useEffect(() => {
        targetRef.current = document.querySelector<HTMLDivElement>("#target")
    }, [])

    const [progress, setProgress] = useState(0)
    useMotionValueEvent(scrollYProgress, "change", setProgress)

    return (
        <>
            <div style={topSpacer} />
            <div id="target" style={targetStyle} />
            <div style={bottomSpacer} />
            <div id="progress" style={progressStyle}>
                {progress.toFixed(4)}
            </div>
        </>
    )
}

const topSpacer: React.CSSProperties = { height: "200vh" }
const bottomSpacer: React.CSSProperties = { height: "100vh" }
const targetStyle: React.CSSProperties = {
    height: "100vh",
    background: "red",
}
const progressStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    background: "white",
    zIndex: 10,
}
