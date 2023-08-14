

class AudioManager
{
    #library = {}

    constructor()
    {
        this.#library[AudioTypes.bigCannonFire] = "BigCannonFire.wav"
        this.#library[AudioTypes.bomb] = "Bomb.wav"
        this.#library[AudioTypes.bombTimer] = "BombTimer.wav"
        this.#library[AudioTypes.bulletOnWood] = "BulletOnWood.wav"
        this.#library[AudioTypes.cannonFire] = "CannonFire.wav"
        this.#library[AudioTypes.setBomb] = "SetBomb.wav"
        this.#library[AudioTypes.tankMove1] = "TankMove1.wav"
        this.#library[AudioTypes.tankMove2] = "TankMove2.wav"
        this.#library[AudioTypes.roundFailure] = "RoundFailure.mp3"
        this.#library[AudioTypes.roundStart] = "RoundStart.mp3"
        this.#library[AudioTypes.variation1] = "Variation1.mp3"
    }
    
    play(sound)
    {
        return new Promise((resolve) => {
            let audio = document.createElement('audio');
            audio.src = `/src/Assets/Sound/${this.#library[sound]}`
            audio.autoplay = true;
            audio.addEventListener("ended", function(){
                audio.currentTime = 0;
                resolve();
           });
            document.head.appendChild(audio);
        })
    }

}