
class Button
{
    isDown = false;
    buttonDown() { this.isDown = true; }
    buttonUp(clicked)
    {
        this.isDown = false;
        if (clicked) this.pressHandler();
    }
    pressHandler = () => {} // Add your own stuff here
}

class Button2D extends Button
{
    sprite;
    text;

    set position(newVal) { this.text.position = newVal; this.sprite.position = newVal; }
    get position() { return this.text.position; }

    set size(newVal) { this.text.size = newVal; this.sprite.size = newVal; }
    get size() { return this.text.size; }

    constructor(type, word = undefined) {
        super();
        this.sprite = new Object2D(type);
        this.sprite.zIndex = 0.2;
        if (word) {
            this.text = new TextSprite();
            this.text.text = word;
            this.text.zIndex = 0.1;
        }

    }

}