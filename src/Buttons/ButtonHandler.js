
class ButtonHandler
{
    _buttons = []
    constructor() {

        Main.canvas.addEventListener("mousedown", (event) => {
            if (event.button !== 0) return;

            for (let button of this._buttons) {
                let cursorPos = [event.clientX / Main.canvas.width, event.clientY / Main.canvas.height]
                if (button.isDown) continue;
                if (Engine.collisionEngine.pointInRectangle(cursorPos, button.sprite)) {
                    button.buttonDown();
                }
            }
        })

        Main.canvas.addEventListener("mouseup", (event) => {
            if (event.button !== 0) return;

            for (let button of this._buttons) {
                let cursorPos = [event.clientX / Main.canvas.width, event.clientY / Main.canvas.height]
                if (!button.isDown) continue;
                button.buttonUp(Engine.collisionEngine.pointInRectangle(cursorPos, button.sprite));
            }
        })


    }




    addButton(button)
    {
        this._buttons.push(button);
    }

}