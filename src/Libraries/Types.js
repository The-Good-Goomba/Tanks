
let i = -1;
const TextureTypes = {
    none: i++,
    bigSheet: i++
}

i = -1
const SpriteTypes = {
    none: i++,
    // The tank colours
    blueTank: i++,
    redTank: i++,
    ashTank: i++,
    blackTank: i++,
    greenTank: i++,
    oliveTank: i++,
    marinTank: i++,
    pinkTank: i++,
    purpleTank: i++,
    violetTank: i++,
    whiteTank: i++,
    yellowTank: i++,

    // Objects
    woodenFloor: i++,
    shell: i++,
    cork: i++,
    oak: i++,
    spruce: i++,
    balsa: i++,

    // Crosses
    blueCross: i++,
    whiteCross: i++,
    redCross: i++,

    hole: i++,

}

i = 0;
const ModelTypes =
    {
        tank: i++,
        plane: i++,
        shell: i++,
        block2x2: i++,
        block2x1: i++,
        triangle: i++,
        halfCylinder: i++,
        block2x4: i++,
    }

i = 0
const SceneTypes =
{
    titleScene: i++,
    mainGame: i++
}
