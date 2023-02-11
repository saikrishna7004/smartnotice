import React, { useEffect, useState } from 'react'
import {Buffer} from 'buffer';

const Home = () => {

    const [slideIndex, setSlideIndex] = useState(0);
    const [slides, setSlides] = useState([])
    
    useEffect(()=>{
        fetch('/api/all').then((data)=>data.json()).then(data=>{
            console.log(data.images)
            let newImages = data.images
            newImages.forEach((e, i)=>{
                newImages[i] =  {...e, image: Buffer.from(e.image.image, 'base64')};
            })
            console.log(newImages)
            setSlides(newImages)
        })
    }, [])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSlideIndex((slideIndex + 1) % slides.length);
        }, 2000);
        return () => clearInterval(intervalId);
    }, [slideIndex, slides.length]);

    return (
        <div className="relative w-full h-64">
            {slides.map((slide, index) => (
                <img
                    key={index}
                    className={`w-full absolute opacity-0 ${index === slideIndex ? "opacity-100" : "opacity-0"
                        } transition-opacity duration-500 ease-in-out`}
                    src={slide.image}
                />
            ))}
        </div>
    );

}

export default Home
