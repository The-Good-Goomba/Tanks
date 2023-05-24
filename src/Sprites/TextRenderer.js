
class TextRenderer extends SpriteRenderer
{
    #texture;
    #textCanvas;

    constructor() {
        super();
        const canvas = new OffscreenCanvas(128,128);
        this.#textCanvas = canvas.getContext("2d");
        this.#textCanvas.textAlign = "center";
        this.#textCanvas.textBaseline = "middle";
        console.log(this.#textCanvas.width);
    }


    async initBindGroups() {
        let len = this._sprites.length;

        if (len === 0) return;
        let newWidth = Math.min(len * 128, 4 * 128);
        let newHeight = Math.ceil(len / 5) * 128;

        if (newWidth === this.#textCanvas.width && newHeight === this.#textCanvas.height) return;

        this.#texture = Main.device.createTexture({
            size: [ this.#textCanvas.width,  this.#textCanvas.height, 1 ],
            format: Main.colourFormat,
            usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.bindGroup = Main.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: this.sampler },
                { binding: 1, resource: this.#texture.createView()},
            ]
        });

    }

    updateInstances() {

    //     MARK: MAKE THE SUPER TEXTURE
    // Make the canvas + texture correct size
        this.initBindGroups();

        // Draw all the things
        // Link: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
        this.#textCanvas.clearRect(0,0,this.#textCanvas.width,this.#textCanvas.height);

        for (let i = 0; i < this._sprites.length; i++)
        {
            let sus = this._sprites[i];

            sus.sprite = { pos: [(i % 5) * 128,Math.floor(i / 5) * 128], size: [128,128] };

            this.#textCanvas.font = `${sus.fontSize}px "${sus.font}"`;
            this.#textCanvas.fillText(sus.text,...sus.pos, 128);

            sus.pos[0]  /=  this.#textCanvas.width;
            sus.pos[1]  /=  this.#textCanvas.height;
            sus.size[0] /= this.#textCanvas.width;
            sus.size[1] /= this.#textCanvas.height;
        }


        // Then copy
        Main.device.queue.copyExternalImageToTexture(
            { source: this.#textCanvas },
            { texture: this.#texture },
            [this.#textCanvas.width, this.#textCanvas.height]
        );
        super.updateInstances();
    }

}