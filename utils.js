function calcAcc(Hit300, Hit100, Hit50, HitMiss) {
    const total = (Hit300 + Hit100 + Hit50 + HitMiss) * 3; // we would multiply by 300, however since we want in percent, 300 / 100 = 3

    return (((Hit300 * 300) + (Hit100 * 100) + (Hit50 * 50)) / total);
}

function calcPosition(position, mainPlayer) {
    const otherSpots = 5;
    const playerHeight = 11.25; //vh
    if (position.Team !== mainPlayer.Team) {
        // if main player isn't on the same team show the top players on that team
        return (position.TeamPosition - 2) * playerHeight;
    }

    return (position.TeamPosition - Math.max(mainPlayer.TeamPosition, otherSpots + 2) + otherSpots) * playerHeight;
}

function getDisplayMods(mods) {
    let str = "+";
    if (mods === 0) {
        return str + "NM";
    }

    // manual checks for specific mods (for example +NC has both NC and DT bits toggled which is unwanted)
    if (mods & (1 << 9)) { // NC
        mods &= ~(1 << 6); // disable DT
    }
    if (mods & (1 << 14)) { // PF
        mods &= ~(1 << 5) // disable SD
    }

    // check if each bit is toggled and add their mod accordingly
    for (let i = 0; i < 31; i++) {
        if ((mods & (1 << i))) {
            str += modNames[i];
        }
    }
    return str;
}

// mod names according to their bit flag (bit 0 is NF, bit 1 is EZ etc)
const modNames = [
    "NF",
    "EZ",
    "TD",
    "HD",
    "HR",
    "SD",
    "DT",
    "RX",
    "HT",
    "NC",
    "FL",
    "AU",
    "SO",
    "AP",
    "PF",
    "4K",
    "5K",
    "6K",
    "7K",
    "8K",
    "FI",
    "RD",
    "CN",
    "TP",
    "9K",
    "CO",
    "1K",
    "3K",
    "2K",
    "V2",
    "MR"
];

export { calcAcc, calcPosition, getDisplayMods };