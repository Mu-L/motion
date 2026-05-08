describe("useScroll with target ref hydrated after useScroll's own effects", () => {
    it("Tracks the target element, not the whole window", () => {
        // Page layout (viewport = 500px tall):
        //   top spacer  : 200vh = 1000px
        //   target      : 100vh = 500px
        //   bottom spacer: 100vh = 500px
        //
        // Total content = 2000px, scroll length = 1500px.
        //
        // With target ref (offset ["start end", "end start"]):
        //   progress = 0 when scrollY <= 500 (target.top hits viewport.bottom)
        //   progress = 1 when scrollY = 1500
        //
        // Without target ref (the bug — falls back to whole window):
        //   progress = scrollY / 1500
        //   At scrollY = 400, progress ≈ 0.267
        cy.visit("?test=use-scroll-target-late-ref")
            .viewport(100, 500)
            .wait(200)

        cy.scrollTo(0, 400)
            .wait(500)
            .get("#progress")
            .then(([$el]: any) => {
                const progress = parseFloat($el.innerText)
                // Target hasn't entered the viewport yet, so progress should
                // still be 0 — anything noticeably above 0 means useScroll is
                // measuring the whole window.
                expect(progress).to.be.lessThan(0.05)
            })
    })
})
