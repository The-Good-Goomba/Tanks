
class TextureLibrary
{
    #texLibrary  = [];
    #spriteLib = [];

    Initialise()
    {
        return new Promise(async (resolve) => {

            this.#texLibrary[TextureTypes.bigSheet] = await ResourceLoader.loadImageResource("/src/Assets/Textures.png");

            // Tanks
            this.#spriteLib[SpriteTypes.blueTank] = { textureType: TextureTypes.bigSheet, pos: [877,1241], size: [32,32] };
            this.#spriteLib[SpriteTypes.redTank] = { textureType: TextureTypes.bigSheet, pos: [914,1241], size: [32,32] };
            this.#spriteLib[SpriteTypes.ashTank] = { textureType: TextureTypes.bigSheet, pos: [185,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.blackTank] = { textureType: TextureTypes.bigSheet, pos: [259,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.greenTank] = { textureType: TextureTypes.bigSheet, pos: [148,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.oliveTank] = { textureType: TextureTypes.bigSheet, pos: [790,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.marinTank] = { textureType: TextureTypes.bigSheet, pos: [221,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.pinkTank] = { textureType: TextureTypes.bigSheet, pos: [4,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.purpleTank] = { textureType: TextureTypes.bigSheet, pos: [927,1172], size: [32,32]};
            this.#spriteLib[SpriteTypes.violetTank] = { textureType: TextureTypes.bigSheet, pos: [444,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.whiteTank] = { textureType: TextureTypes.bigSheet, pos: [110,1241], size: [32,32]};
            this.#spriteLib[SpriteTypes.yellowTank] = { textureType: TextureTypes.bigSheet, pos: [816,1241], size: [32,32]};

            // Objects
            this.#spriteLib[SpriteTypes.woodenFloor] = { textureType: TextureTypes.bigSheet, pos: [5,522], size: [1024,512]};
            this.#spriteLib[SpriteTypes.shell] = { textureType: TextureTypes.bigSheet, pos: [753,1241], size: [32,16]};
            this.#spriteLib[SpriteTypes.cork] = { textureType: TextureTypes.bigSheet, pos: [5,1039], size: [64,64]};
            this.#spriteLib[SpriteTypes.oak] = { textureType: TextureTypes.bigSheet, pos: [143,1103], size: [64,64]};
            this.#spriteLib[SpriteTypes.spruce] = { textureType: TextureTypes.bigSheet, pos: [5,1172], size: [64,64]};
            this.#spriteLib[SpriteTypes.balsa] = { textureType: TextureTypes.bigSheet, pos: [143,1039], size: [64,64]};

            // Crosses
            this.#spriteLib[SpriteTypes.blueCross] = { textureType: TextureTypes.bigSheet, pos: [964,1172], size: [64,64]};
            this.#spriteLib[SpriteTypes.whiteCross] = { textureType: TextureTypes.bigSheet, pos: [281,1172], size: [64,64]};
            this.#spriteLib[SpriteTypes.redCross] = { textureType: TextureTypes.bigSheet, pos: [42,1241], size: [64,64]};

            this.#spriteLib[SpriteTypes.hole] = { textureType: TextureTypes.bigSheet, pos: [143,1172], size: [64,64]};

            for (var i = 0; i < this.#spriteLib.length; i++)
            {
                this.#spriteLib[i].pos[0] /= this.getTexture(this.#spriteLib[i].textureType).width;
                this.#spriteLib[i].pos[1] /= this.getTexture(this.#spriteLib[i].textureType).height;
                this.#spriteLib[i].size[0] /= this.getTexture(this.#spriteLib[i].textureType).width;
                this.#spriteLib[i].size[1] /= this.getTexture(this.#spriteLib[i].textureType).height;
            }

            resolve();
        });
    }

    getTexture(type)
    {
        return this.#texLibrary[type];
    }

    getSprite(type)
    {
        return this.#spriteLib[type];
    }


}
