
class TextRenderer extends SpriteRenderer
{
    #texture;
    #canvas;
    #canvasContext;

    constructor() {
        super();
        this.#canvas = new OffscreenCanvas(128,128);
        this.#canvasContext = this.#canvas.getContext("2d");
        this.#canvasContext.textAlign = "center";
        this.#canvasContext.textBaseline = "middle";
    }


    async initBindGroups() {
        let len = this._sprites.length;

        if (len === 0) return;
        let newWidth = Math.min(len * 128, 4 * 128);
        let newHeight = Math.ceil(len / 5) * 128;

        if (newWidth === this.#canvas.width && newHeight === this.#canvas.height) return;

        this.#texture = Main.device.createTexture({
            size: [ this.#canvas.width,  this.#canvas.height, 1 ],
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
        this.#canvasContext.clearRect(0,0,this.#canvas.width,this.#canvas.height);

        for (let i = 0; i < this._sprites.length; i++)
        {
            let sus = this._sprites[i];

            sus.sprite = { pos: [(i % 5) * 128,Math.floor(i / 5) * 128], size: [128,128] };

            this.#canvasContext.font = `${sus.fontSize}px "${sus.font}"`;
            this.#canvasContext.fillText(sus.text,sus.sprite.pos[0],sus.sprite.pos[1], 128);

            sus.sprite.pos[0]  /=  this.#canvas.width;
            sus.sprite.pos[1]  /=  this.#canvas.height;
            sus.sprite.size[0] /= this.#canvas.width;
            sus.sprite.size[1] /= this.#canvas.height;
        }


        // Then copy
        Main.device.queue.copyExternalImageToTexture(
            { source: this.#canvas },
            { texture: this.#texture },
            [this.#canvas.width, this.#canvas.height]
        );
        super.updateInstances();
    }

}