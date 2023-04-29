
class ResourceLoader
{
    static loadTextResource(url) {
        return new Promise(async (resolve, reject) => {
            var request = await fetch(url);
            if (request.status < 200 || request.status > 299) {
                reject('Error: HTTP Status ' + request.status + ' on resource ' + url);
            } else {
                resolve(request.text());
            }
        });
    }

    // Load a JSON resource from a file over the network
    static async loadJSONResource(url) {
        var json = await this.loadTextResource(url);
        return JSON.parse(json);
    }

    // Load an image resource from a file over the network
    static loadImageResource(url) {
        return new Promise((resolve) => {
            var image = new Image();
            image.onload = async function() {

                let img = await createImageBitmap(image)

                let tex = Main.device.createTexture({
                    size: [ image.width,  image.height, 1 ],
                    format: Main.colourFormat,
                    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT
                });

                Main.device.queue.copyExternalImageToTexture(
                    { source: img },
                    { texture: tex },
                    [image.width, image.height]
                );

                resolve(tex);
            };
            image.src = url;
        });

    }
}

