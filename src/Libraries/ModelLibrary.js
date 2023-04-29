class ModelLibrary
{
    #library = [];

    Initialise()
    {
        return new Promise(async (resolve) => {
            this.#library[ModelTypes.tank] = await ModelLoader.getDataFromObj("/src/Assets/tankP.obj");
            this.#library[ModelTypes.plane] = await ModelLoader.getDataFromObj("/src/Assets/plane.obj");
            this.#library[ModelTypes.shell] = await ModelLoader.getDataFromObj("/src/Assets/shell.obj");
            this.#library[ModelTypes.block2x2] = await ModelLoader.getDataFromObj("/src/Assets/block.obj");
            this.#library[ModelTypes.block2x1] = await ModelLoader.getDataFromObj("/src/Assets/shortBlock.obj");
            this.#library[ModelTypes.triangle] = await ModelLoader.getDataFromObj("/src/Assets/triangularPrism.obj");
            this.#library[ModelTypes.halfCylinder] = await ModelLoader.getDataFromObj("/src/Assets/halfCylinder.obj");
            this.#library[ModelTypes.block2x4] = await ModelLoader.getDataFromObj("/src/Assets/longBigBlock.obj");
            resolve();
        });
    }

    get(type)
    {
        return this.#library[type]
    }

}

class ModelLoader
{
    static async getDataFromObj(url)
    {
        const fileContents = await ModelLoader.#getFileContents(url);
        return ModelLoader.#parseFile(fileContents);
    }

    static #getFileContents = async (filename) =>
    {
        const file = await fetch(filename);
        return await file.text();
    };

    static #stringsToNumbers = (strings) =>
    {
        const numbers = [];
        for (const str of strings)
        {
            numbers.push(parseFloat(str));
        }
        return numbers;
    }

    static #parseFile = (fileContents) =>
    {
        const positions = [];
        const texCoords = [];
        const normals = [];

        const finalPositions = [];
        const finalTexCoords = [];
        const finalNormals = [];
        const finalMembers = [];


        const lines = fileContents.split('\n');
        let pos = [0,0,0];
        let meshMember = [];
        let currentMember = 0;
        let groupCount = 0;
        for(const line of lines)
        {
            const [ command, ...values] = line.split(' ', 4);

            if (command === 'g')
            {
                let bruh = true;
                for (let i = 0; i < meshMember.length; i++)
                {
                    if ( values[0] === meshMember[i]) { currentMember = i; bruh = false }
                }
                if (bruh) { currentMember = meshMember.length; meshMember.push(values[0]);}
                if (currentMember > groupCount) { groupCount = currentMember }
            }

            if (command === 'v')
            {
                pos = ModelLoader.#stringsToNumbers(values);
                positions.push(pos);
            }
            else if (command === 'vt')
            {
                texCoords.push(ModelLoader.#stringsToNumbers(values));
            }
            else if (command === 'vn')
            {
                normals.push(ModelLoader.#stringsToNumbers(values));
            }

            else if (command === 'f')
            {

                for (const group of values)
                {
                    const [ positionIndex, texCoordIndex, normalIndex] = ModelLoader.#stringsToNumbers(group.split('/'));

                    finalPositions.push(...positions[positionIndex - 1]);
                    finalNormals.push(...normals[normalIndex - 1]);
                    finalTexCoords.push(...texCoords[texCoordIndex - 1]);
                    finalMembers.push(currentMember);
                }
            }

        }

        return { positions: Engine.makeBuffer(new Float32Array(finalPositions)),
            normals: Engine.makeBuffer(new Float32Array(finalNormals)),
            texCoords: Engine.makeBuffer(new Float32Array(finalTexCoords)),
            groups: Engine.makeBuffer(new Uint32Array(finalMembers)),
            groupCount: (groupCount + 1),
            vertexCount: finalPositions.length / 3};
    }

}