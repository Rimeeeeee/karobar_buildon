import React, { useState, useEffect, useRef } from "react";
import RINGS from "vanta/dist/vanta.rings.min";


const VantaEffect: React.FC = () => {
  
  const [vantaEffect, setVantaEffect] = useState<any>(null); 
  const myRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vantaEffect && myRef.current) {
      const effect = RINGS({
        el: myRef.current,
        // THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 190.0,
        minWidth: 200.0,
        scale: 0.9,
        scaleMobile: 1.0,
        backgroundColor: 0x0, 
        color: 0x8500ff, 
      });

      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={myRef} style={{ width: "100%", height: "98%" }} />;
};

export default VantaEffect;

