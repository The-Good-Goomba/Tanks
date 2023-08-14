

class AudioManager
{

    
    
    play(sound)
    {
        return new Promise((resolve) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.async = false;
            script.addEventListener('load', () => {
                resolve();
            });
            document.head.appendChild(script);
        })
    }

}