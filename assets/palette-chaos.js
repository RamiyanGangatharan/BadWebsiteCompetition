(function () {
    const palettes = ["palette-0", "palette-1", "palette-2", "palette-3", "palette-4"];
    let i = Math.floor(Math.random() * palettes.length);

    function applyPalette(index) {
        for (const name of palettes) {
            document.body.classList.remove(name);
        }

        document.body.classList.add(palettes[index]);
    }

    applyPalette(i);

    window.setInterval(function () {
        i = (i + 1) % palettes.length;
        applyPalette(i);
    }, 2000);
})();
