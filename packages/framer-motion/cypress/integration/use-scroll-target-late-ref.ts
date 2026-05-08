describe("useScroll with target ref hydrated after useScroll's own effects", () => {
    it("Tracks the target element, not the whole window", () => {
        // Target sits 1000px below the top in a 2000px-tall page (500px
        // viewport). At scrollY=400 the target is still off-screen, so
        // progress must be ~0. If useScroll falls back to whole-window
        // tracking, progress is 400/1500 ≈ 0.267.
        cy.visit("?test=use-scroll-target-late-ref")
            .viewport(100, 500)
            .wait(200)

        cy.scrollTo(0, 400)
            .wait(500)
            .get("#progress")
            .then(([$el]: any) => {
                expect(parseFloat($el.innerText)).to.be.lessThan(0.05)
            })
    })
})
