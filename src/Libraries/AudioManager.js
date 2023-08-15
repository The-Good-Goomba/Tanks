

class AudioManager
{
    static #library = {}
    static canPlay = false

    static Initialise()
    {
        AudioManager.#library[AudioTypes.bigCannonFire] = "BigCannonFire.wav"
        AudioManager.#library[AudioTypes.bomb] = "Bomb.wav"
        AudioManager.#library[AudioTypes.bombTimer] = "BombTimer.wav"
        AudioManager.#library[AudioTypes.bulletOnWood] = "BulletOnWood.wav"
        AudioManager.#library[AudioTypes.cannonFire] = "CannonFire.wav"
        AudioManager.#library[AudioTypes.setBomb] = "SetBomb.wav"
        AudioManager.#library[AudioTypes.tankMove1] = "TankMove1.wav"
        AudioManager.#library[AudioTypes.tankMove2] = "TankMove2.wav"
        AudioManager.#library[AudioTypes.roundFailure] = "RoundFailure.mp3"
        AudioManager.#library[AudioTypes.roundStart] = "RoundStart.mp3"
        AudioManager.#library[AudioTypes.variation1] = "Variation1.mp3"

    }

    
    static playOnce(sound)
    {
        if (!AudioManager.canPlay) { return; }
        let audio = document.createElement('audio');
        audio.src = `/src/Assets/Sound/${AudioManager.#library[sound]}`
        audio.autoplay = true;
        // audio.controls = true;
        audio.addEventListener("ended", function(){
            audio.currentTime = 0;
            document.body.removeChild(audio);
        });
        document.body.appendChild(audio);
    }

}